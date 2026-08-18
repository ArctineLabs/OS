#!/bin/bash

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

# Root or not?

if [ "$EUID" -ne 0 ]
  then echo -e "Please run the installer with administrative permissions (using root).\nBitte führen Sie den Installer mit Administratorrechten aus.\nSvp, exécutez l'installateur en tant qu'administrateur."
  exit
fi


#WIP

case $(gum choose --header "Language:" --label-delimiter=":" "English:en" "Schweizer Hochdeutsch:de_CH" "Bundesdeutsch (DE):de_DE" "Français (Incomplet):fr" "Español/Castellano (Inacabado):es") in #"Debug from source"
    "en")
        source /Arctine/Library/Translations/GumpackNG/install/en.arctinelocale
    ;;
    "fr")
        source /Arctine/Library/Translations/GumpackNG/install/fr.arctinelocale
    ;;
    "de_CH")
        source /Arctine/Library/Translations/GumpackNG/install/de_CH.arctinelocale
    ;;
    "de_DE")
        source /Arctine/Library/Translations/GumpackNG/install/de_DE.arctinelocale
    ;;
    "es")
        source /Arctine/Library/Translations/GumpackNG/install/es.arctinelocale
    ;;
    *)
        exit 1
    ;;
esac



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

    gum format -- "# $arlo_GumpackNG_checkrequirements_SystemRequirements" \
        "- $arlo_GumpackNG_checkrequirements_BootedMode: $InstallerRequirements_BootMode ($InstallerRequirements_BootMode_Judgement)" \
        "- $arlo_GumpackNG_checkrequirements_RAM: $InstallerRequirements_Memory $arlo_GumpackNG_checkrequirements_GB ($InstallerRequirements_Memory_Judgement)" \
        "- $arlo_GumpackNG_checkrequirements_Network" \
        "- $arlo_GumpackNG_checkrequirements_20GBFreeStorage"

    case $InstallerRequirements_Memory_Judgement in
        GOOD)
            echo "$arlo_GumpackNG_checkrequirements_Judgement_Memory_Good ($InstallerRequirements_Memory $arlo_GumpackNG_checkrequirements_GB > 8 $arlo_GumpackNG_checkrequirements_GB)"
        ;;
        OK)
            arlo_GumpackNG_checkrequirements_Judgement_Memory_Ok
        ;;
        BAD)
            echo "$arlo_GumpackNG_checkrequirements_Judgement_Memory_Bad"
        ;;
    esac

    case $InstallerRequirements_BootMode_Judgement in
        GOOD)
            echo "$arlo_GumpackNG_checkrequirements_Judgement_Boot_Good"
        ;;
        BAD)
            echo "$arlo_GumpackNG_checkrequirements_Judgement_Boot_Bad"
        ;;
    esac

    case $InstallerRequirements_CanInstall in
        yes)
            case $(gum choose --header "$arlo_GumpackNG_checkrequirements_Accept" "$arlo_GumpackNG_Yes" "$arlo_GumpackNG_No") in
                "$arlo_GumpackNG_Yes")
                    true
                ;;
                "$arlo_GumpackNG_No")
                    exit 1
                ;;
            esac
        ;;
        no)
            echo "$arlo_GumpackNG_checkrequirements_Fail"
            read -rp "$arlo_GumpackNG_checkrequirements_Fail_EnterToExit"
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
    if [[ $(gum choose --header "$arlo_GumpackNG_Welcome_Header" "$arlo_GumpackNG_Welcome_Continue" "$arlo_GumpackNG_Welcome_Exit") == "$arlo_GumpackNG_Welcome_Continue" ]]; then
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
        Installer_Partitioning_Method=$(gum choose --header "$arlo_GumpackNG_Partitioning_InstallMethodSelection" --label-delimiter=":" "$arlo_GumpackNG_Partitioning_InstallMethodSelection_Custom:custom" "$arlo_GumpackNG_Partitioning_InstallMethodSelection_Exit:exit")
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
    echo "$arlo_GumpackNG_InstallConfirm_Header
    
$arlo_GumpackNG_InstallConfirm_Details"
    Installer_Confirm=$(gum choose --header "$arlo_GumpackNG_InstallConfirm_Header" "$arlo_GumpackNG_InstallConfirm_Install" "$arlo_GumpackNG_InstallConfirm_Back")
    case "$Installer_Confirm" in
        "$arlo_GumpackNG_InstallConfirm_Install")
            installation
        ;;
        "$arlo_GumpackNG_InstallConfirm_Back")
            export Installer_PartitioningDone=false
            export Installer_PartitioningCustom_Selection_Done=false
            partitioning
        ;;
        *)
            echo "$arlo_GumpackNG_InstallConfirm_Exiting"
            exit 1
        ;;
    esac
}

installation() {
    installation_spinner() {
        gum spin --spinner points --title "$@"
    }
    installation_spinner "$arlo_GumpackNG_Installation_Process_MountingRootPartition" -- mount "$Installer_PathToRootPartition" /mnt
    installation_spinner "$arlo_GumpackNG_Installation_Process_MountingBootPartition" -- mount "$Installer_PathToBootPartition" /mnt/boot --mkdir
    installation_spinner "$arlo_GumpackNG_Installation_Process_CloningSource" -- git clone https://github.com/ArctineLabs/OS /mnt/OS
    # shellcheck disable=SC2046
    echo "$arlo_GumpackNG_Installation_Process_Packages"; sleep 0.5
    # shellcheck disable=SC2046
    pacstrap -K /mnt $(cat /mnt/OS/packages.x86_64)
    installation_spinner "$arlo_GumpackNG_Installation_Process_fstabGeneration" --show-output -- genfstab -U /mnt >> /mnt/etc/fstab
    cp /Arctine/GumpackNG/setup.sh /mnt/setup.sh -v;chmod +x /mnt/setup.sh
#   installation_spinner "Creating subvolume for snapshots..." -- btrfs subvolume create /mnt/.snapshots
#   installation_spinner "Creating Snapper config for snapshots..." -- snapper --root=/mnt create-config /
    echo "$arlo_GumpackNG_Installation_Process_CopyInstaller"
    echo "$arlo_GumpackNG_Installation_Process_EnterChroot"
    echo "$Installer_PathToBootPartition" >> /mnt/bootpart.txt
    arch-chroot /mnt /setup.sh
    while [[ ! $Installer_HostnameDefined ]]; do
        if gum input --placeholder "$arlo_GumpackNG_Installation_EnterHostname"; then
            Installer_HostnameDefined=true
        else
            false
        fi
    done
    ending
}

ending() {
    case $(gum choose --header "$arlo_GumpackNG_Installation_End_Header" "$arlo_GumpackNG_Installation_End_Reboot" "$arlo_GumpackNG_Installation_End_ExitInstaller") in
        "$arlo_GumpackNG_Installation_End_Reboot")
            umount -R /mnt || true
            systemctl reboot || reboot
        ;;
        "$arlo_GumpackNG_Installation_End_ExitInstaller"|*)
            exit
        ;;
    esac
}

# Extra

network.test() {
    export Installer_NetworkConnected_Ping=0
    # gum spin --spinner points --title "Testing connection to Google..." -- ping google.com -c 1 || echo "Could not establish a connection to Google."
    gum spin --spinner points --title "$arlo_GumpackNG_Network_Test_Loading GitHub..." -- ping github.com -c 1 && export Installer_NetworkConnected_Ping=$((Installer_NetworkConnected_Ping + 1)) || echo "$arlo_GumpackNG_Network_Test_Fail GitHub."
    gum spin --spinner points --title "$arlo_GumpackNG_Network_Test_Loading gnu.org..." -- ping gnu.org -c 1 && export Installer_NetworkConnected_Ping=$((Installer_NetworkConnected_Ping + 1))  ||  echo "$arlo_GumpackNG_Network_Test_Fail gnu.org."
}

network.fix() {
    Installer_Network_Selection=$(gum choose --header "$arlo_GumpackNG_Network_Fix_Header" --label-delimiter=":" "$arlo_GumpackNG_Network_Fix_Retry:retry" "$arlo_GumpackNG_Network_Fix_Settings:settings")
    case "$Installer_Network_Selection" in
        retry)
            true
        ;;
        settings)
            gnome-control-center network
        ;;
        *)
            echo "$arlo_GumpackNG_Network_Fix_NoOption"
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
    echo "$arlo_GumpackNG_Partitioning_Custom"
    Installer_PartitioningCustom_Selection=$(gum choose --header "$arlo_GumpackNG_Partitioning_Custom_Header" --label-delimiter=":" "$arlo_GumpackNG_Partitioning_Custom_ModifyDisk:diskutility"  "$arlo_GumpackNG_Partitioning_Custom_SelectPartitions:select")
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
        echo $arlo_GumpackNG_Partitioning_Select_EnterPartitionPaths
        lsblk -pno "NAME,SIZE,TYPE,FSTYPE" | grep "part"
        Installer_PathToBootPartition=$(gum input --placeholder "$arlo_GumpackNG_Partitioning_Select_BootPartitionPlaceholder")
        Installer_PathToRootPartition=$(gum input --placeholder "$arlo_GumpackNG_Partitioning_Select_RootPartitionPlaceholder")
        if gum confirm "$arlo_GumpackNG_Partitioning_Select_FormatBootPartition";then
            export Installer_FormatEFI=true
        else
            export Installer_FormatEFI=false
        fi

        echo "$arlo_GumpackNG_Partitioning_Select_ConfirmWipe_Header
            "$arlo_GumpackNG_Partitioning_Select_ConfirmWipe_Details"
            $arlo_GumpackNG_Partitioning_Select_ConfirmWipe_SelectedRootPartition | $Installer_PathToRootPartition
            $arlo_GumpackNG_Partitioning_Select_ConfirmWipe_SelectedBootPartition | $Installer_PathToBootPartition
            $arlo_GumpackNG_Partitioning_Select_ConfirmWipe_SelectedBootPartition | $Installer_FormatEFI"
        echo $arlo_GumpackNG_Partitioning_Select_ConfirmWipe_ConfirmText
        Installer_PartitioningCustom_Selection_Confirm=$(gum input)
        case "$Installer_PartitioningCustom_Selection_Confirm" in
            "$arlo_GumpackNG_Partitioning_Select_ConfirmWipe_Confirm")
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
    gum spin --spinner points --title "$arlo_GumpackNG_Partitioning_Custom_Process_Formatting $Installer_PathToRootPartition..." --show-error -- mkfs.btrfs -f "$Installer_PathToRootPartition" || bail "$arlo_GumpackNG_bail_Error_RootPart"
    if [[ $Installer_FormatEFI ]]; then
        gum spin --spinner points --title "$arlo_GumpackNG_Partitioning_Custom_Process_Formatting $Installer_PathToBootPartition..." --show-error -- mkfs.fat -F 32 "$Installer_PathToBootPartition" || bail "$arlo_GumpackNG_bail_Error_BootPart"
    fi
    export Installer_PartitioningCustom_Selection_Done=true
    export Installer_PartitioningDone=true
}

# Disregard
bail() { echo -e "${BRed}${arlo_GumpackNG_bail}${Color_Off} $1"; read -rp "$arlo_GumpackNG_bail_ENTER"; exit 1; }

main
