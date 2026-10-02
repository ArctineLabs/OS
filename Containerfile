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

RUN pacman -Syu --noconfirm --needed base-devel git make cargo go-md2man ostree glib2 openssl zstd zlib rust pkgconf glibc clang

WORKDIR /home/build
RUN --mount=type=bind,from=ctx,source=/,target=/ctx \
    /ctx/scripts/build.sh

FROM base AS system
COPY --from=builder /output /
COPY --from=builder /pkgout /selinuxpkg
RUN grep "= */var" /etc/pacman.conf | sed "/= *\/var/s/.*=// ; s/ //" | xargs -n1 sh -c 'mkdir -p "/usr/lib/sysimage/$(dirname $(echo $1 | sed "s@/var/@@"))" && mv -v "$1" "/usr/lib/sysimage/$(echo "$1" | sed "s@/var/@@")"' '' && \
    sed -i -e "/= *\/var/ s/^#//" -e "s@= */var@= /usr/lib/sysimage@g" -e "/DownloadUser/d" /etc/pacman.conf

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

RUN rm -rfv /milanium /airootfs

LABEL \
    org.opencontainers.image.title="ArctineOS" \
    org.opencontainers.image.description="ArctineOS base system - simple, opinionated, easy" \
    org.opencontainers.image.version="26.10" \
    org.opencontainers.image.url="https://arctine.rootsource.cc/OS" \
    org.opencontainers.image.source="https://github.com/ArctineLabs/OS" \
    org.opencontainers.image.licenses="GPL-3.0-or-later" \
    containers.bootc="1"

RUN bootc container lint
