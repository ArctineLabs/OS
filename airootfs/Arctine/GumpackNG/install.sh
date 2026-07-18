#!/bin/bash

# Root or not?

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
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

checkrequirements() {
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

    ## Check if installation is even possible

    case $InstallerRequirements_JudgementScore in
        3|5)
            InstallerRequirements_CanInstall=yes
        ;;
        1|2|4)
            InstallerRequirements_CanInstall=no
        ;;
    esac

    gum format -- "# System requirements" \
        "- Mode booted: $InstallerRequirements_BootMode ($InstallerRequirements_BootMode_Judgement)" \
        "- RAM: $InstallerRequirements_Memory GB ($InstallerRequirements_Memory_Judgement)" \
        "- Network connection (will be setup later)" \
        "- 20GB free storage"

    case $InstallerRequirements_Memory_Judgement in
        GOOD)
            echo "PASS: The installed RAM is above the recommended amount ($InstallerRequirements_Memory GB > 8 GB)"
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
            case $(gum choose --header "Acknowledge info and continue installation?" "Yes" "No") in
                Yes)
                    true
                ;;
                No)
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

checkrequirements

# Variables

export Color_Off='\033[0m'       # Text Reset
export BRed='\033[1;31m'         # Red
export White='\033[0;37m'        # White
export BIWhite='\033[1;97m'      # White

export Installer_NetworkConnected=false
export Installer_NetworkConnected_Ping=0
export Installer_PathToRootPartition=
export Installer_PathToSWAP=
export Installer_PathToBootPartition=
export Installer_PartitioningDone=false
export Installer_FormatEFI=false
export Installer_PartitioningCustom_Selection_Done=false


# Core

main() {
    if [[ $(gum choose --header "Welcome to the ArctineOS installer." "Continue" "Exit") == "Continue" ]]; then
        modules
    else
        exit
    fi
}

modules() {
    network
    clock
    partitioning
    confirm
}

# Modules

network() {
    while [[ $Installer_NetworkConnected == false ]]; do
        network.test || network.fix
        if [[ $Installer_NetworkConnected_Ping == 2 ]]; then
            export Installer_NetworkConnected=true
        fi
    done
}

clock() {
    timedatectl
}

partitioning() {
    while ! $Installer_PartitioningDone; do
#       export Installer_Partitioning_Method=$(gum choose --header "How would you like to install?" --label-delimiter=":" "Erase a disk and install ArctineOS:erase" "Custom Installation:custom" "Quit installer:exit")
        Installer_Partitioning_Method=$(gum choose --header "How would you like to install?" --label-delimiter=":" "Partition disk and install ArctineOS:custom" "Quit installer:exit")
        case $Installer_Partitioning_Method in
            custom)
                partitioning.custom
            ;;
            *)
                exit 1
            ;;
        esac
        export Installer_Partitioning_Method
    done
}

confirm() {
    echo "You are about to start the installation process.
    
By choosing \"Install now\", the root partition will be formatted (all data erased) and if enabled, the EFI partition will too.
(pressing [ESCAPE] will exit the installer and cancel the installation process.)"
    Installer_Confirm=$(gum choose --header "Install?" "Install now" "Back to partitioning")
    case "$Installer_Confirm" in
        "Install now")
            installation
        ;;
        "Back to partitioning")
            export Installer_PartitioningDone=false
            partitioning
        ;;
        *)
            echo "Exiting..."
            exit 1
        ;;
    esac
}

installation() {
    installation_spinner() {
        gum spin --spinner points --title "$@"
    }
    installation_spinner "Mounting root partition..." -- mount "$Installer_PathToRootPartition" /mnt
    installation_spinner "Mounting root partition..." -- mount "$Installer_PathToBootPartition" /mnt/boot --mkdir
    installation_spinner "Cloning ArctineOS source..." -- git clone https://github.com/ArctineLabs/OS /mnt/OS
    # shellcheck disable=SC2046
    echo "Installing packages to target system..."; sleep 0.5
    # shellcheck disable=SC2046
    pacstrap -K /mnt $(cat /mnt/OS/packages.x86_64)
    installation_spinner "Generating fstab..." --show-output -- genfstab -U /mnt >> /mnt/etc/fstab
    cp /Arctine/GumpackNG/setup.sh /mnt/setup.sh -v;chmod +x /mnt/setup.sh
    installation_spinner "Creating subvolume for snapshots..." -- btrfs subvolume create /mnt/.snapshots
    installation_spinner "Creating Snapper config for snapshots..." -- snapper --root=/mnt create-config /
    echo "Copying chroot setup to target system..."
    echo "Entering target system..."
    echo "$Installer_PathToBootPartition" >> /mnt/bootpart.txt
    arch-chroot /mnt /setup.sh
    ending
}

ending() {
    case $(gum choose --header "Installation finished successfully!" "Reboot now" "Exit Installer") in
        "Reboot now")
            umount -R /mnt || true
            systemctl reboot || reboot
        ;;
        "Exit Installer"|*)
            exit
        ;;
    esac
}

# Extra

network.test() {
    export Installer_NetworkConnected_Ping=0
    # gum spin --spinner points --title "Testing connection to Google..." -- ping google.com -c 1 || echo "Could not establish a connection to Google."
    gum spin --spinner points --title "Testing connection to GitHub..." -- ping github.com -c 1 && export Installer_NetworkConnected_Ping=$((Installer_NetworkConnected_Ping + 1)) || echo "Could not establish a connection to GitHub."
    gum spin --spinner points --title "Testing connection to gnu.org..." -- ping gnu.org -c 1 && export Installer_NetworkConnected_Ping=$((Installer_NetworkConnected_Ping + 1))  || echo "Could not establish a connection to gnu.org."
}

network.fix() {
    Installer_Network_Selection=$(gum choose --header "Your device failed to establish a connection to GitHub or archlinux.org. Choose an option below:" --label-delimiter=":" "Retry:retry" "Open Network Settings:settings")
    case "$Installer_Network_Selection" in
        retry)
            true
        ;;
        settings)
            gnome-control-center network
        ;;
        *)
            echo "Nothing selected, retrying anyways..."
        ;;
    esac
}

partitioning.automatic() {
    lsblk -dno NAME,SIZE,TYPE
}

partitioning.automatic.process() {
    true
}

partitioning.custom() {
    echo "The system needs at least:
- one boot partition (needs to be FAT32)
- one root partition (needs to be btrfs) (where the actual system resides)
- optionally, swap"
    Installer_PartitioningCustom_Selection=$(gum choose --header "Custom Install options:" --label-delimiter=":" "1. Modify disk:diskutility"  "2. Select partitions to use (boot, swap, root):select")
    case "$Installer_PartitioningCustom_Selection" in
        diskutility)
            gnome-disks
        ;;
        select)
            partitioning.select
        ;;
        *)
        # js go back
            false
        ;;
    esac
}

partitioning.select() {
    while ! $Installer_PartitioningCustom_Selection_Done; do
        echo "Enter full path of the boot and root partitions:"
        lsblk -pno "NAME,SIZE,TYPE,FSTYPE" | grep "part"
        Installer_PathToBootPartition=$(gum input --placeholder "boot partition (e.g. /dev/sda1, /dev/nvme0n1p1...)")
        Installer_PathToRootPartition=$(gum input --placeholder "root partition (e.g. /dev/sda2, /dev/nvme0n1p2...)")
        if gum confirm "Format boot partition? (Do not do this if it already existed before install)";then
            export Installer_FormatEFI=true
        else
            export Installer_FormatEFI=false
        fi

        echo "Confirm the changes, as your partitions are going to be wiped.
            Details:
            Selected root partition | $Installer_PathToRootPartition
            Selected boot partition | $Installer_PathToBootPartition
            Format EFI? (boot part) | $Installer_FormatEFI"
        echo "To confirm and make changes to these partitions, type \"Confirm\" with capital C. To cancel and make any other changes, type anything else."
        Installer_PartitioningCustom_Selection_Confirm=$(gum input)
        case "$Installer_PartitioningCustom_Selection_Confirm" in
            "Confirm")
                export Installer_PartitioningCustom_Selection_Done=true
                partitioning.custom.process
            ;;
            *)
                false
            ;;
        esac

        export Installer_PathToBootPartition
        export Installer_PathToRootPartition
        export Installer_PartitioningCustom_Selection_Confirm
    done
}

partitioning.custom.process() {
    gum spin --spinner points --title "Formatting $Installer_PathToRootPartition..." --show-error -- mkfs.btrfs -f "$Installer_PathToRootPartition" || bail "Failed to format root partition..."
    if [[ $Installer_FormatEFI ]]; then
        gum spin --spinner points --title "Formatting $Installer_PathToBootPartition..." --show-error -- mkfs.fat -F 32 "$Installer_PathToBootPartition" || bail "Failed to format boot partition..."
    fi
    export Installer_PartitioningCustom_Selection_Done=true
    export Installer_PartitioningDone=true
}

# Disregard
bail() { echo -e "${BRed}ERROR: Installer failed with the following message:${Color_Off} $1"; read -rp "[ENTER]"; exit 1; }

main
