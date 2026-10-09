#!/bin/bash

TO_DISK=

# Root or not?

if [ "$EUID" -ne 0 ]
    then echo -e "Please run the installer with administrative permissions (using root).\nBitte führen Sie den Installer mit Administratorrechten aus.\nSvp, exécutez l'installateur en tant qu'administrateur."
    exit
fi

diskselect() {
    TO_DISK=$(zenity --forms --add-list Disks --list-values="$(lsblk -pdno NAME | while IFS= read -r line; do echo "${line}|"; done | tr -d '\n' | sed 's/|$//')" --text "Select disk to install ArctineOS") || exit 1
    export TO_DISK
}

askforconfirm() {
    if zenity --question --text="Confirm installation to $TO_DISK? All data on the selected disk will be wiped."; then
        true
    else
        exit 1
    fi
}

installation() {
    sudo bootc install to-disk "$TO_DISK" \
      --wipe \
      --filesystem btrfs \
      --bootloader grub \
      --source-imgref docker://ghcr.io/arctinelabs/arctineos:latest \
      --target-imgref ghcr.io/arctinelabs/arctineos:latest | while IFS= read -r line; do echo "# $line"; done | zenity --progress --title="Installing to $TO_DISK..." --pulsate
}

askforreboot() {
    if zenity --question --text="Restart now?"; then
        reboot
    else
        exit
    fi
}

diskselect
askforconfirm
installation
askforreboot