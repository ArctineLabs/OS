#!/usr/bin/env bash

# This code has originally been borrowed from github.com/bootcrew/mono 
# Copyright 2025 tulilirockz 
# 
# Licensed under the Apache License, Version 2.0. 
# You may obtain a copy of the License at: # https://www.apache.org/licenses/LICENSE-2.0 
# 
# Modifications Copyright 2026 Arctine Laboratories

set -xeuo pipefail

mkdir -p /usr/lib/dracut/dracut.conf.d/
printf "systemdsystemconfdir=/etc/systemd/system\nsystemdsystemunitdir=/usr/lib/systemd/system\n" | tee /usr/lib/dracut/dracut.conf.d/30-bootcrew-fix-bootc-module.conf
printf 'reproducible=yes\nhostonly=no\ncompress=zstd\nadd_dracutmodules+=" bootc "' | tee "/usr/lib/dracut/dracut.conf.d/30-bootcrew-bootc-container-build.conf"
dracut --force "$(find /usr/lib/modules -maxdepth 1 -type d | grep -v -E "*.img" | tail -n 1)/initramfs.img"
