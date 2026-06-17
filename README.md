# TrackSim CLI

**An unofficial,** native TrackSim integration and management tool for Windows and Linux. This project provides a robust, seamless approach to install and manage the TrackSim client for **Euro Truck Simulator 2 (ETS2)** and **American Truck Simulator (ATS)**.

## Features

- **Cross-Platform Compatibility**: Fully supports native Windows installations and Linux Proton (Wine) environments, including native `truckersmp-cli` setups.
- **Automated Deployments**: Installs dependencies (Node.js & pnpm) and fetches the latest TrackSim client directly from the official API automatically.
- **Smart Path Auto-Detection**: Intelligently locates your Steam installations and Wine prefixes across multiple drives and library folders without manual intervention.
- **Clean Uninstallation**: Completely purges the TrackSim integration and associated configurations securely via a single command.

---

## 🚀 Installation & Usage

You can deploy and manage TrackSim via our fully **Automated Scripts** (Recommended) or through a **Manual CLI Installation** for advanced users.

### Method 1: Automated Installation (Recommended)

The easiest way to get started. These scripts will automatically verify your environment, install Node.js and `pnpm` if they are missing, install all required dependencies, and prompt you interactively to choose your game.

First, clone the repository or download the source code:
```bash
git clone https://github.com/renardozt/tracksim-cli.git
cd tracksim-cli
```

#### Windows Users
Simply double-click the batch files, or run them from your Command Prompt/PowerShell:
- **To Install**: Run `install.bat`
- **To Uninstall**: Run `uninstall.bat`

*Note: If Node.js is missing, the scripts will securely utilize `winget` to install it. You may need to restart your terminal/script afterward.*

#### Linux Users
Open your terminal in the directory and execute the shell scripts:
- **To Install**: Run `./install.sh`
- **To Uninstall**: Run `./uninstall.sh`

*Note: The Linux scripts will automatically detect your package manager (`apt`, `pacman`, `dnf`, or `zypper`) to install prerequisites if needed.*

---

### Method 2: Manual CLI Installation

If you prefer managing global packages and running commands directly, you can install `tracksim-cli` system-wide.

#### Prerequisites
- **Node.js**: Version 16.x or newer.
- **Package Manager**: `pnpm` (Highly Recommended) or `npm`.

#### Global Setup
Install the CLI tool globally on your system:

```bash
# 1. Clone the repository
git clone https://github.com/renardozt/tracksim-cli.git
cd tracksim-cli

# 2. Install local dependencies
pnpm install

# 3. Install the CLI globally
# Note: On Linux, depending on your environment, you may need to prefix this with `sudo`
pnpm install -g .
```

#### CLI Usage
Once installed globally, the `tracksim-cli` command becomes available anywhere in your terminal.

```bash
# Install TrackSim
tracksim-cli install ets2
tracksim-cli install ats

# Uninstall TrackSim
tracksim-cli uninstall ets2
tracksim-cli uninstall ats
```

#### Advanced Manual Overrides
If your game is installed in a non-standard location and auto-detection fails, you can explicitly define your paths using flags:

```bash
# Linux (Wine) Example
tracksim-cli install ets2 --game-dir /path/to/game/data --prefix-dir /path/to/wine/prefix

# Windows Example (Note: --prefix-dir is safely ignored on Windows)
tracksim-cli install ets2 --game-dir "D:\Games\Steam\steamapps\common\Euro Truck Simulator 2"
```

- `--game-dir`: The directory containing the game executable and `bin` folder.
- `--prefix-dir`: The Wine prefix directory (e.g., `compatdata/<AppID>/pfx`). 

---

## Known Issues / Limitations

- **Tracksim Discord RPC (Linux)**: Discord Rich Presence currently fails to initialize and synchronize within the TrackSim client under Linux Proton (Wine).

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for full details.
