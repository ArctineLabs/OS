#!/bin/bash

hwclock --systohc

/Arctine/Scripts/hookhelper filesystem

dracut --force

if [[ cat /sys/firmware/efi/fw_platform_size ]]; then
    grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
else
    grub-install --target=i386-pc $(cat /bootpart.txt)
fi

grub-mkconfig -o /boot/grub/grub.cfg

echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/10-wheel
chmod 440 /etc/sudoers.d/10-wheel
visudo -c

read -p "Enter username for new user: " Username
usermod -aG wheel $Username

while ! passwd "$username"; do
    echo "Try again"
done

echo "Exiting back to host"