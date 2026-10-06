#!/usr/bin/env bash

# This code has originally been borrowed from github.com/bootcrew/mono 
# Copyright 2025 tulilirockz 
# 
# Licensed under the Apache License, Version 2.0. 
# You may obtain a copy of the License at: # https://www.apache.org/licenses/LICENSE-2.0 
# 
# Modifications Copyright 2026 Arctine Laboratories

set -xeuo pipefail

# git clone https://aur.archlinux.org/yay-bin.git
# 
# pushd yay-bin/
# 	# shellcheck disable=SC1091
# 	source PKGBUILD
# 	# shellcheck disable=SC2154
# 	pacman -S "${depends[@]}" base-devel --noconfirm --needed
# 	chown nobody:nobody -Rv .
# 	sudo -u nobody makepkg -sr
# 	pacman -Uv ./"yay"*.pkg.tar.zst --noconfirm
# popd
# 
# yay -S --noconfirm libselinux

pacman -S pcre2 pkgconf python python-build python-pip python-setuptools ruby swig xz glibc flex --needed --noconfirm

gpg --keyserver hkps://keyserver.ubuntu.com --recv-keys 63191CE94183098689CAB8DB7EF137EC935B0EAF
gpg --keyserver hkps://keyserver.ubuntu.com --recv-keys 68D21823342A13683AEB3E4EFB4C685B5DC1C13E

install_aur() {
	pkg="$1"
	git clone "https://aur.archlinux.org/${pkg}.git"
	pushd "$pkg"/
		# shellcheck disable=SC1091
		source PKGBUILD
		# shellcheck disable=SC2154
		# pacman -S "${depends[@]}" --noconfirm --needed
		chown nobody:nobody -Rv .
		sudo -u nobody env HOME=/home/nobody CARGO_HOME=/home/nobody/.cargo makepkg -dc --noconfirm --skippgpcheck
		# shellcheck disable=SC2154
		cp ./"${pkgname}"-[0-9]*.pkg.tar.zst /pkgout/ # /output reserved for bootc, different directory needed temporarily
		pacman -U ./"${pkgname}"-[0-9]*.pkg.tar.zst --noconfirm
	popd
}

mkdir -p /pkgout
install_aur libsepol
install_aur libselinux
install_aur bootupd

mv /pkgout/libsepol-[0-9]*.pkg.tar.zst /pkgout/libsepol.pkg.tar.zst
mv /pkgout/libselinux-[0-9]*.pkg.tar.zst /pkgout/libselinux.pkg.tar.zst
mv /pkgout/bootupd-[0-9]*.pkg.tar.zst /pkgout/bootupd.pkg.tar.zst

git clone "https://github.com/bootc-dev/bootc.git" bootc

pushd bootc/
	make bin install-all DESTDIR=/output
popd
