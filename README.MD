## Arctine OS Build Config
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
