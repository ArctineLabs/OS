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

# Acknowledgements
GNOME Extensions (found under airootfs/usr/share/gnome-shell/extensions/):

- [blur-my-shell@aunetx](https://extensions.gnome.org/extension/3193/blur-my-shell/)
- [copyous@boerdereinar.dev](https://extensions.gnome.org/extension/8834/copyous/)
- [gsconnect@andyholmes.github.io](https://extensions.gnome.org/extension/1319/gsconnect/)
- [tilingshell@ferrarodomenico.com](https://extensions.gnome.org/extension/7065/tiling-shell/)

The rest of the projects should have their licenses in the final filesystem.

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
