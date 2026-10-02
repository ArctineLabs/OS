# ArctineOS
The README is still being worked on. 

# Build
To build, you use the `mkarctine` tool. Make sure it is in the root of the Git repository, and proceed to run the following commands:

```bash
./mkarctine prep
sudo ./mkarctine build
```

Every time you want to rebuild, it is recommended to clear out the tmp/ and out/ folders.

```bash
sudo ./mkarctine clean
sudo ./mkarctine clean-out
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

# Other
> Old readme
Hi, this is just a dummy README for now, if you want to build this config, clone the repo, cd to it, make an "out" dir, and run (as root):

    mkarchiso -v -w /tmp/archiso-tmp -o /path/to/cloned-repo/out /path/to/cloned-repo/

You need these packages installed on an Arch install at the bare minimum:
- git
- xorriso
- arch-install-scripts
- dosfstools
- erofs-utils
- libburn
- libisoburn
- libisofs
- mtools
- squashfs-tools
- archiso
