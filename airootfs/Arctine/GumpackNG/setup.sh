#!/bin/bash

# This script is a big mess, I might clean it up later on...

if [ "$EUID" -ne 0 ]
  then echo -e "Please run the setup with administrative permissions."
  exit 1
fi

function scriptcolors() {
    # Reset
    export Color_Off='\033[0m'       # Text Reset

    # Regular Colors
 
    # Bold
    export BRed='\033[1;31m'         # Red
    export BYellow='\033[1;33m'      # Yellow
    export BBlue='\033[1;34m'        # Blue
    export BCyan='\033[1;36m'        # Cyan
 
    echo -e "${BBlue}[i] The colour variables have been set.${Color_Off}"
}

limsg() {
    # LiMSG, as seen in the TyrianOS builder.
    case $1 in
        s)
            lmsg_one="STAGE"
        ;;

    esac
    lmsg_two=$2
    case $3 in
        i)
            lmsg_three="${BBlue}INFO"
        ;;
        w)
            lmsg_three="${BYellow}WARN"
        ;;
        e)            
            lmsg_three="${BRed}ERRR"
        ;;
        *)
            lmsg_three=$3
        ;;
    esac
    echo -e "[ArctineOS Installer(LiMSG)/${BCyan}${lmsg_one} ${lmsg_two}${Color_Off}/${lmsg_three}${Color_Off}]: $4"
}

scriptcolors

limsg s 1 i "Populating keyring..."
pacman-key --init
pacman-key --populate archlinux

limsg s 2 i "Installing dracut..."
pacman -S dracut --noconfirm

if [[ $1 == "reinstall" ]]; then
    limsg s 2.5 i "Reinstalling packages because user said to"
    pacman -Syu --needed --noconfirm "$(cat /mnt/OS/packages.x86_64)"
fi

git config --global --add safe.directory /OS

# shellcheck disable=SC2164
pushd /OS/arctine-pkg
    chown nobody:nobody -Rv .
    limsg s 3 i "Installing Milanium dependencies..."
    # shellcheck disable=SC1091
    source PKGBUILD
    # shellcheck disable=SC2154
    pacman -S "${depends[@]}" --noconfirm
    limsg s 3 i "Making Milanium..."
    sudo -u nobody makepkg -srf
    limsg s 3 i "Installing Milanium..."
    # shellcheck disable=SC2154
    pacman -Uv ./"${pkgname}"-"${pkgver}"-"${pkgrel}"-"${arch[*]}".pkg.tar.zst --noconfirm
    limsg s 3 i "Activating executable flags for ArCLI modules..."
    chmod +x /Arctine/Tools/ArCLI/Executables/arcli
    chmod +x /Arctine/Tools/ArCLI/Modules/*
# shellcheck disable=SC2164
popd

limsg s 4 i "Syncing clock..."
hwclock --systohc

limsg s 5 i "Running filesystem override..."
/Arctine/Scripts/hookhelper filesystem

limsg s 6 i "Enabling NetworkManager..."
systemctl enable NetworkManager
limsg s 6 i "Enabling GNOME Display Manager..."
systemctl enable gdm

limsg s 7 i "Setting up Snapper snapshots..."
umount /.snapshots || true
rmdir /.snapshots || true
snapper -c root create-config /
btrfs subvolume delete /.snapshots
mkdir /.snapshots
mount /.snapshots

limsg s 8 i "Removing now obsolete mkinitcpio..."
pacman -R mkinitcpio mkinitcpio-archiso --noconfirm

limsg s 8 i "Force generate image kernel..."
dracut --force

if cat /sys/firmware/efi/fw_platform_size; then
    limsg s 9 i "Installing GRUB for EFI..."
    grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
else
    grub-install --target=i386-pc "$(cat /bootpart.txt)"
fi

limsg s 9 i "Generating GRUB configuration..."
grub-mkconfig -o /boot/grub/grub.cfg

echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/10-wheel
chmod 440 /etc/sudoers.d/10-wheel
visudo -c

limsg s 10 i "Generating locales (this might take a while!)..."
locale-gen

limsg s 11 i "Performing symbolic links for ArCLI"
ln -s /Arctine/Tools/ArCLI/Executables/arcli /usr/bin/arcli

# This will be done by the initial setup in the future.

#read -rp "Enter username for new user: " Username
#useradd -m -G wheel "$Username"
#
#while ! passwd "$Username"; do
#    echo "Try again"
#done

echo "Exiting back to host"
