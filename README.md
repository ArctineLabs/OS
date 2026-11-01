# ArctineOS
An arch-based immutable distro designed for simplicity and ease of use, with (arguably) sane defaults.
[![Build ArctineOS image](https://github.com/ArctineLabs/OS/actions/workflows/build.yml/badge.svg)](https://github.com/ArctineLabs/OS/actions/workflows/build.yml) [![Build ArctineOS ISO](https://github.com/ArctineLabs/OS/actions/workflows/build-iso.yml/badge.svg)](https://github.com/ArctineLabs/OS/actions/workflows/build-iso.yml)

To check out information about the OS itself, rather than this repo or its development, [[check the website!]](https://arctine.rootsource.cc/OS)

## :warning: For users still using the mutable version
ArctineOS is switching to an immutable approach. Because of this, future updates performed on the mutable version may fail. To fix this, do one of the following:
### 1. Backup everything and switch to the immutable version
(instructions to follow)
### 2. Pull updates from [distrolabs/ArctineOS](https://github.com/distrolabs/ArctineOS) instead
To do this, you need to replace /OS/' remote with the one from distrolabs. This can be done in either two ways:
#### sed
A quick solution is to run this command in the terminal:
```sudo sed -i 's#url = https://github.com/ArctineLabs/OS#url = https://github.com/distrolabs/ArctineOS#g' /OS/.git/config```
This replaces the old remote URL with the distrolabs one
#### Text editor
Using administrative rights, open the /OS/.git/config file.

Locate the line that ```url = https://github.com/ArctineLabs/OS``` is on (usually line 7), and replace it with ```url = https://github.com/distrolabs/ArctineOS```.

# How to build/install

## Building
Dependencies: `podman`, `just`
To locally build ArctineOS, clone this repository then run `just build`

```bash
git clone https://github.com/ArctineLabs/OS.git
cd OS/
just build
```

## Installing
To install ArctineOS, either download the [live ISO](https://github.com/ArctineLabs/OS/actions/runs/38091085428/artifacts/11684316349) which automatically launches the installer on startup, or run the following command on a system/live ISO with bootc
```bash
sudo bootc install to-disk /dev/(preferred disk) \
--wipe \
      --filesystem btrfs \
      --bootloader systemd \
      --composefs-backend \
      --source-imgref docker://ghcr.io/arctinelabs/arctineos:latest \
      --target-imgref ghcr.io/arctinelabs/arctineos:latest
```
Alternatively for systems without bootc but with podman:
```bash
sudo podman run --rm --privileged --pid=host --ipc=host \
  -v /dev:/dev \
  -v /var/lib/containers:/var/lib/containers \
  --security-opt label=disable \
  ghcr.io/arctinelabs/arctineos:latest \
  bootc install to-disk /dev/(preferred disk) --wipe \
      --filesystem btrfs \
      --bootloader systemd \
      --composefs-backend \
      --source-imgref docker://ghcr.io/arctinelabs/arctineos:latest \
      --target-imgref ghcr.io/arctinelabs/arctineos:latest
```

# Acknowledgements/Licensing
ArctineOS itself is licensed under the GPLv3-or-later, the license is found at the root of the repository in a file named `LICENSE`

### Derived code
The following files contain code derived from [bootcrew/mono](https://github.com/bootcrew/mono) (Copyright 2025 tulilirockz, Apache License 2.0):
- `Justfile`
- `bcvk.just`
- `scripts/bootc-rootfs.sh`
- `scripts/build.sh`
- `scripts/initramfs.sh`

The following files contain code derived from [apollo-linux/apollo](https://github.com/apollo-linux/apollo) (Copyright 2025 tulilirockz, Apache License 2.0):
- `.github/workflows/build-iso.yml` (partially)

The following files contain code derived from [ArctineLabs/TyrianOS (sister project)](https://github.com/ArctineLabs/TyrianOS) (Copyright 2025 kevadesu, Apache License 2.0):
- `.github/workflows/build.yml`
- `.github/workflows/build-iso.yml` (partially)

### GNOME Extensions (3rd-party)
(found under airootfs/usr/share/gnome-shell/extensions/)

- [blur-my-shell@aunetx](https://extensions.gnome.org/extension/3193/blur-my-shell/) [(GPLv3 LICENSE)](https://github.com/ArctineLabs/OS/blob/main/airootfs/usr/share/gnome-shell/extensions/blur-my-shell%40aunetx/LICENSE)
- [copyous@boerdereinar.dev](https://extensions.gnome.org/extension/8834/copyous/) [(GPLv3 LICENSE)](https://github.com/boerdereinar/copyous/blob/main/LICENSE)
- [gsconnect@andyholmes.github.io](https://extensions.gnome.org/extension/1319/gsconnect/) [(MULTIPLE LICENSES)](https://github.com/GSConnect/gnome-shell-extension-gsconnect/tree/main/LICENSES)
- [tilingshell@ferrarodomenico.com](https://extensions.gnome.org/extension/7065/tiling-shell/) [(GPLv3 LICENSE)](https://github.com/domferr/tilingshell/blob/main/LICENSE)

The respective licenses for these projects are included in the final filesystem.

# Translations

To translate, copy the respective en.arctinelocale file and change the "en" to the code of the language you want to translate a component into.

The .arctinelocale files in question can be found under directories in the [Arctine Translations Library](https://github.com/ArctineLabs/OS/tree/main/airootfs/Arctine/Library/Translations/) under directories within.
