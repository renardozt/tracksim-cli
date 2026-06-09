# TrackSim Linux

Native TrackSim integration and management tool for Linux (TruckersMP). This project provides a straightforward, CLI-based approach to seamlessly install and manage the TrackSim client on Linux systems.

## Features

- **Automated Installation**: Downloads the latest TrackSim client directly from the official API.
- **Wine Prefix Integration**: Automatically installs `tracksim.exe` and `updater.exe` into your TruckersMP Wine prefix.
- **Easy Uninstallation**: Completely removes the TrackSim integration and associated configurations with a single command.

## Installation

Ensure you have Node.js and your preferred package manager (npm or pnpm) installed, then install globally:

```bash
sudo npm install -g .
```

## Usage

You can use the CLI tool to manage your TrackSim integration for TruckersMP:

```bash
tracksim-linux install
tracksim-linux uninstall
```

### Commands

- `install`: Downloads TrackSim and installs it into your TruckersMP Wine prefix. Supports native `truckersmp-cli` environments.
- `uninstall`: Removes TrackSim components and configurations from your TruckersMP Wine prefix.

## Known Issues / Not Working

- **Tracksim Discord RPC**: Discord Rich Presence currently fails to initialize within the TrackSim client. While `truckersmp-cli` handles IPC bridging, TrackSim is currently unable to properly connect to the mapped Discord IPC pipe.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
