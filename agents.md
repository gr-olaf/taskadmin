# Agents Configuration

## Environment

- **OS:** Alpine Linux v3.24.1
- **Architecture:** x86_64
- **Package Manager:** apk (Alpine Package Keeper)

## System State

### Available Tools
| Tool | Path |
|------|------|
| wget | /usr/bin/wget |
| apk | /sbin/apk |

### Missing (not installed)
- git, curl, ssh
- node / npm / pnpm / yarn
- python3 / pip
- gcc / g++ / make / cmake
- docker / podman

## Setup Commands

### Install essential tools
```sh
apk add --no-cache git curl openssh build-base
```

### Install Node.js
```sh
apk add --no-cache nodejs npm
```

### Install Python
```sh
apk add --no-cache python3 py3-pip
```

### Install all common dev tools
```sh
apk add --no-cache git curl openssh build-base nodejs npm python3 py3-pip
```

## Notes

- Alpine uses `apk` as its package manager (not apt/yum/dnf)
- Packages are installed with `apk add --no-cache <package>`
- Search packages with `apk search <query>`
- Info about a package with `apk info <package>`
- This is a minimal container-like environment; most development tools need to be installed
