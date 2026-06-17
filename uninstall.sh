#!/bin/bash

echo "======================================"
echo "   TrackSim CLI Linux Uninstaller     "
echo "======================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Node.js and npm
if ! command_exists node || ! command_exists npm; then
    echo "[!] Node.js or npm is not installed. TrackSim CLI requires Node.js."
    echo "Please install Node.js to use the uninstaller."
    exit 1
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
echo "Ensuring project dependencies are installed using pnpm..."
pnpm install
if [ $? -ne 0 ]; then
    echo "[!] Failed to install dependencies."
    exit 1
fi

echo ""
echo "Which game do you want to uninstall TrackSim for?"
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
echo "Running TrackSim uninstallation for $game..."
node index.js uninstall "$game"

echo ""
read -p "Press any key to exit..." -n 1 -s
echo ""
