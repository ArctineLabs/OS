#!/bin/bash

# shellcheck disable=SC2164
pushd /OS/arctine-pkg
    chown nobody:nobody -Rv .
    sudo -u nobody makepkg -sr
    pacman -Uv ./milanium-*.pkg.tar.zst
# shellcheck disable=SC2164
popd

hwclock --systohc

/Arctine/Scripts/hookhelper filesystem

snapper create-config /

dracut --force

if cat /sys/firmware/efi/fw_platform_size; then
    grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
else
    grub-install --target=i386-pc "$(cat /bootpart.txt)"
fi

grub-mkconfig -o /boot/grub/grub.cfg

echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/10-wheel
chmod 440 /etc/sudoers.d/10-wheel
visudo -c

read -rp "Enter username for new user: " Username
useradd -m -G wheel "$Username"

while ! passwd "$Username"; do
    echo "Try again"
done

echo "Exiting back to host"
