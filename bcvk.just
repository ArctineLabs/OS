# This code has originally been borrowed from github.com/bootcrew/mono 
# Copyright 2025 tulilirockz 
# 
# Licensed under the Apache License, Version 2.0. 
# You may obtain a copy of the License at: # https://www.apache.org/licenses/LICENSE-2.0 
# 
# Modifications Copyright 2026 Arctine Laboratories

# bcvk ephemeral VM boot testing recipes
#
# bubblewrap is required in each image: bootc install to-disk (which bcvk
# runs inside the container to create the VM disk) calls bwrap internally
# to sandbox bootupctl during bootloader setup. Same applies to both
# ephemeral and libvirt run paths.

# List available bcvk commands
default:
    @just --list --justfile {{justfile()}}

# Run an ephemeral VM from a named image and SSH in (destroyed on exit)
ephemeral IMAGE:
    bcvk ephemeral run-ssh "{{IMAGE}}-bootc:latest"

# Build and run ephemeral VM for a named image
build-and-test IMAGE:
    just build {{IMAGE}}
    just bcvk ephemeral {{IMAGE}}

# Boot ephemeral VM and verify no systemd units failed
[group('check')]
check IMAGE:
    #!/bin/bash
    set -euo pipefail
    echo "==> Booting {{IMAGE}} and checking for failed units..."
    failed=$(bcvk ephemeral run-ssh "{{IMAGE}}-bootc:latest" -- systemctl --failed --no-pager --no-legend)
    printf '%s\n' "$failed"
    if [ -n "$failed" ]; then
        echo "FAIL: failed units detected in {{IMAGE}}" >&2
        exit 1
    fi
    echo "OK: no failed units in {{IMAGE}}"

# Boot persistent libvirt VM and verify no systemd units failed (also verifies SSH)
[group('check')]
libvirt-check IMAGE:
    #!/bin/bash
    set -euo pipefail
    name="bootcrew-check-{{IMAGE}}"
    echo "==> Booting {{IMAGE}} (libvirt) and checking for failed units..."
    bcvk libvirt run --name "$name" --replace "{{IMAGE}}-bootc:latest"
    failed=$(bcvk libvirt ssh "$name" -- systemctl --failed --no-pager --no-legend)
    bcvk libvirt rm --stop --force "$name"
    printf '%s' "$failed"
    if [ -n "$failed" ]; then
        echo "FAIL: failed units detected in {{IMAGE}}" >&2
        exit 1
    fi
    echo "OK: no failed units in {{IMAGE}}"

# Check all four distro images for failed units
[group('check')]
check-all:
    just bcvk check arctine

# Run ephemeral VMs for all four distro images in sequence
test-all:
    just bcvk ephemeral arctine
