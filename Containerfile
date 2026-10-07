# Some contents of this code have been borrowed from bootcrew/mono at https://github.com/bootcrew/mono/blob/main/arch/Containerfile, that being licensed under the Apache 2.0 license.

# Copy airootfs and Milanium to target for building
FROM scratch AS ctx

# Copy scripts, airootfs and Milanium
COPY scripts /scripts
COPY airootfs /airootfs
COPY arctine-pkg /milanium
COPY packages.x86_64 /packagelist.x64

# Arch Linux itself
FROM quay.io/archlinux/archlinux:latest AS base

FROM base AS builder

RUN pacman -Syu --noconfirm --needed base-devel git make cargo go-md2man ostree glib2 openssl zstd zlib rust pkgconf glibc clang efibootmgr grub gcc-libs

WORKDIR /home/build
RUN mkdir -p /home/nobody \
    && chown nobody:nobody -Rv /home/nobody
RUN --mount=type=bind,from=ctx,source=/,target=/ctx \
    /ctx/scripts/build.sh

FROM base AS system
COPY --from=builder /output /
COPY --from=builder /pkgout /selinuxpkg
RUN grep "= */var" /etc/pacman.conf | sed "/= *\/var/s/.*=// ; s/ //" | xargs -n1 sh -c 'mkdir -p "/usr/lib/sysimage/$(dirname $(echo $1 | sed "s@/var/@@"))" && mv -v "$1" "/usr/lib/sysimage/$(echo "$1" | sed "s@/var/@@")"' '' && \
    sed -i -e "/= *\/var/ s/^#//" -e "s@= */var@= /usr/lib/sysimage@g" -e "/DownloadUser/d" /etc/pacman.conf

## THIS HAS BEEN TAKEN FROM https://github.com/bootcrew/mono/pull/9
# Remove NoExtract rules, otherwise no additional languages and help pages can be installed
# See https://gitlab.archlinux.org/archlinux/archlinux-docker/-/blob/master/pacman-conf.d-noextract.conf?ref_type=heads
RUN sed -i 's/^[[:space:]]*NoExtract/#&/' /etc/pacman.conf

RUN --mount=type=tmpfs,dst=/tmp --mount=type=cache,dst=/usr/lib/sysimage/cache/pacman pacman -Sy glibc --noconfirm

RUN --mount=type=bind,from=ctx,source=/,target=/ctx \
    pacman -Syu --noconfirm $(cat /ctx/packagelist.x64)

RUN pacman -U --noconfirm /selinuxpkg/*.pkg.tar.zst \
    && rm -rf /selinuxpkg

COPY --from=ctx /milanium /milanium
COPY --from=ctx /airootfs /airootfs

WORKDIR /milanium
RUN chown -Rv nobody:nobody /milanium

USER nobody

RUN makepkg -d --noconfirm

USER root
RUN pacman -U --noconfirm ./milanium*.pkg.tar.zst

RUN /Arctine/Scripts/hookhelper filesystem

RUN --mount=type=tmpfs,dst=/tmp --mount=type=tmpfs,dst=/root \
    --mount=type=bind,from=ctx,source=/,target=/ctx \
    /ctx/scripts/initramfs.sh

RUN --mount=type=bind,from=ctx,source=/,target=/ctx \
    sed -i 's|^HOME=.*|HOME=/var/home|' "/etc/default/useradd" && \
    /ctx/scripts/bootc-rootfs.sh

COPY --from=ghcr.io/ublue-os/brew:latest /system_files /
RUN --mount=type=cache,dst=/var/cache \
    --mount=type=cache,dst=/var/log \
    --mount=type=tmpfs,dst=/tmp \
    /usr/bin/systemctl preset brew-setup.service && \
    /usr/bin/systemctl preset brew-update.timer && \
    /usr/bin/systemctl preset brew-upgrade.timer

WORKDIR /
RUN rm -rfv /milanium /airootfs
RUN echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/10-wheel && \
    chmod 440 /etc/sudoers.d/10-wheel && \
    visudo -c

RUN chmod 4755 /usr/bin/newgidmap && \
    chmod 4755 /usr/bin/newuidmap

RUN locale-gen

RUN /usr/bin/systemctl enable NetworkManager

LABEL \
    org.opencontainers.image.title="ArctineOS" \
    org.opencontainers.image.description="ArctineOS - simple, opinionated, easy" \
    org.opencontainers.image.url="https://arctine.rootsource.cc/OS" \
    org.opencontainers.image.source="https://github.com/ArctineLabs/OS" \
    org.opencontainers.image.licenses="GPL-3.0-or-later" \
    containers.bootc="1"

RUN bootc container lint
