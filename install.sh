#!/bin/bash

echo "======================================"
echo "    TrackSim CLI Linux Installer      "
echo "======================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Node.js and npm
if ! command_exists node || ! command_exists npm; then
    echo "[!] Node.js or npm is not installed."
    echo "Attempting to install Node.js and npm automatically..."
    
    if command_exists apt; then
        echo "Detected APT package manager (Debian/Ubuntu)."
        sudo apt update
        sudo apt install -y nodejs npm
    elif command_exists pacman; then
        echo "Detected Pacman package manager (Arch Linux)."
        sudo pacman -Sy --noconfirm nodejs npm
    elif command_exists dnf; then
        echo "Detected DNF package manager (Fedora/RHEL)."
        sudo dnf install -y nodejs npm
    elif command_exists zypper; then
        echo "Detected Zypper package manager (openSUSE)."
        sudo zypper install -y nodejs npm
    else
        echo "[!] Could not determine package manager. Please install Node.js manually."
        exit 1
    fi
    
    if ! command_exists node || ! command_exists npm; then
        echo "[!] Installation failed or Node.js is still not found. Please install manually."
        exit 1
    fi
else
    echo "[OK] Node.js and npm are installed."
fi

# Check for pnpm
if ! command_exists pnpm; then
    echo "[!] pnpm is not installed. Installing pnpm globally..."
    sudo npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "[!] Failed to install pnpm."
        exit 1
    fi
fi

# Install dependencies
echo "Installing project dependencies using pnpm..."
pnpm install
if [ $? -ne 0 ]; then
    echo "[!] Failed to install dependencies."
    exit 1
fi

echo ""
echo "Which game do you want to install TrackSim for?"
echo "1) Euro Truck Simulator 2 (ETS2)"
echo "2) American Truck Simulator (ATS)"
read -p "Enter your choice [1/2]: " choice

game=""
if [ "$choice" = "1" ]; then
    game="ets2"
elif [ "$choice" = "2" ]; then
    game="ats"
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "Running TrackSim installation for $game..."
node index.js install "$game"

echo ""
read -p "Press any key to exit..." -n 1 -s
echo ""
