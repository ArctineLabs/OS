#!/bin/bash

TO_DISK=

# Root or not?

if [ "$EUID" -ne 0 ]
    then echo -e "Please run the installer with administrative permissions (using root).\nBitte führen Sie den Installer mit Administratorrechten aus.\nSvp, exécutez l'installateur en tant qu'administrateur."
    exit
fi

# Eligible or not?

export InstallerRequirements_BootMode=
export InstallerRequirements_BootMode_Judgement=
export InstallerRequirements_Memory=
export InstallerRequirements_Memory_Judgement=
export InstallerRequirements_BootMode=
export InstallerRequirements_JudgementScore=0
export InstallerRequirements_CanInstall=no

# Get system information

## BootMode

if [[ -d /sys/firmware/efi ]]; then
    InstallerRequirements_BootMode=UEFI
    InstallerRequirements_JudgementScore=$((InstallerRequirements_JudgementScore + 1))
    InstallerRequirements_BootMode_Judgement="GOOD"
else
    InstallerRequirements_BootMode=BIOS
    InstallerRequirements_BootMode_Judgement="BAD"
fi

## Memory

InstallerRequirements_Memory=$(free --giga | awk '/^Mem:/{print $2}')
if [[ $InstallerRequirements_Memory -gt 3 ]]; then
    if [[ $InstallerRequirements_Memory -gt 7 ]]; then
        InstallerRequirements_JudgementScore=$((InstallerRequirements_JudgementScore + 4))
        InstallerRequirements_Memory_Judgement="GOOD"
    else
        InstallerRequirements_JudgementScore=$((InstallerRequirements_JudgementScore + 2))
        InstallerRequirements_Memory_Judgement="OK"
    fi
else
        InstallerRequirements_Memory_Judgement="BAD"
fi

checkrequirements() {
    ## Check if installation is even possible

    case $InstallerRequirements_JudgementScore in
        3|5)
            InstallerRequirements_CanInstall=yes
        ;;
        1|2|4)
            InstallerRequirements_CanInstall=no
        ;;
    esac

        case $InstallerRequirements_Memory_Judgement in
        GOOD)
            echo "PASS: The installed RAM is above the recommended amount. ($InstallerRequirements_Memory GB > 8 GB)"
        ;;
        OK)
            echo "WARN: The recommended amount of installed RAM is 8 GB. While $InstallerRequirements_Memory GB is supported, performance may be limited."
        ;;
        BAD)
            echo "FAIL: The installed RAM does not meet the minimum requirement of 4 GB RAM installed, and the installer can not continue."
        ;;
    esac

    case $InstallerRequirements_BootMode_Judgement in
        GOOD)
            echo "PASS: The system is booted in UEFI mode. The installation can continue."
        ;;
        BAD)
            echo "FAIL: The system is booted in BIOS mode. For now, installing ArctineOS on legacy BIOS systems is not supported by this installer."
        ;;
    esac

    case $InstallerRequirements_CanInstall in
        yes)
            case $(gum choose --header "Acknowledge information and continue installation?" "Yes" "No") in
                "Yes")
                    true
                ;;
                "No")
                    exit 1
                ;;
            esac
        ;;
        no)
            echo "The requirements have not been met and the installer cannot continue."
            read -rp "Press [ENTER] to exit."
            exit 1
        ;;
    esac
}

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
      --bootloader systemd \
      --composefs-backend \
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

checkrequirements
diskselect
askforconfirm
installation
askforreboot
