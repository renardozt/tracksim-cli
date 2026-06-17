#!/bin/bash

echo "======================================"
echo "    TrackSim CLI Linux Installer      "
echo "======================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

PKG_MGR=""
if command_exists apt; then
    PKG_MGR="apt"
elif command_exists pacman; then
    PKG_MGR="pacman"
elif command_exists dnf; then
    PKG_MGR="dnf"
elif command_exists zypper; then
    PKG_MGR="zypper"
fi

install_packages() {
    if [ -z "$PKG_MGR" ]; then
        echo "[!] Could not determine package manager."
        return 1
    fi
    
    if [ "$PKG_MGR" = "apt" ]; then
        sudo apt update && sudo apt install -y "$@"
    elif [ "$PKG_MGR" = "pacman" ]; then
        sudo pacman -Sy --noconfirm "$@"
    elif [ "$PKG_MGR" = "dnf" ]; then
        sudo dnf install -y "$@"
    elif [ "$PKG_MGR" = "zypper" ]; then
        sudo zypper install -y "$@"
    fi
}

# Check for Node.js and npm
if ! command_exists node || ! command_exists npm; then
    echo "[!] Node.js or npm is not installed."
    echo "Attempting to install Node.js and npm automatically..."
    
    install_packages nodejs npm
    
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
if ! node index.js install "$game"; then
    echo ""
    echo "======================================"
    echo "        Auto-Detection Failed         "
    echo "======================================"
    echo "It looks like TrackSim-CLI couldn't automatically find your game."
    echo ""
    # Detect user's shell for the correct activation instruction
    ACTIVATE_CMD="source ~/.venv/bin/activate"
    if [[ "$SHELL" == *"fish"* ]]; then
        ACTIVATE_CMD="source ~/.venv/bin/activate.fish"
    elif [[ "$SHELL" == *"csh"* ]]; then
        ACTIVATE_CMD="source ~/.venv/bin/activate.csh"
    fi

    # Check if truckersmp-cli is already installed
    HAS_TRUCKERSMP=0
    if command_exists truckersmp-cli || [ -x "$HOME/.venv/bin/truckersmp-cli" ]; then
        HAS_TRUCKERSMP=1
    fi

    echo "Options:"
    echo "1) Install truckersmp-cli (Recommended for Linux)"
    echo "2) Provide manual paths"
    echo "3) Exit"
    read -p "Enter your choice [1/2/3]: " fallback_choice
    

    if [ "$fallback_choice" = "1" ]; then
        if [ "$HAS_TRUCKERSMP" -eq 1 ]; then
            echo ""
            echo "[OK] truckersmp-cli is already installed."
            echo "After initializing your game directories with truckersmp-cli, re-run this TrackSim installer."
            echo ""
            exit 0
        fi
        echo "Installing truckersmp-cli via pip..."
        
        # Ensure python3 is installed
        if ! command_exists python3; then
            echo "python3 is not installed. Attempting to install..."
            install_packages python3
        fi

        # Ensure pip is installed
        if ! command_exists pip3; then
            echo "pip3 is not installed. Attempting to install..."
            if [ "$PKG_MGR" = "pacman" ]; then
                install_packages python-pip
            else
                install_packages python3-pip
            fi
        fi
        
        # Ensure python3-venv is installed on Debian/Ubuntu
        if [ "$PKG_MGR" = "apt" ]; then
            install_packages python3-venv
        fi
        
        echo "Creating Python virtual environment in ~/.venv..."
        python3 -m venv ~/.venv
        
        echo "Activating virtual environment and installing truckersmp-cli..."
        source ~/.venv/bin/activate
        pip install truckersmp-cli
        
        echo ""
        echo "[OK] truckersmp-cli installed!"
        echo "To use truckersmp-cli, please activate the virtual environment in your terminal first:"
        echo "  $ACTIVATE_CMD"
        echo "  truckersmp-cli"
        echo "After initializing your game directories with truckersmp-cli, re-run this TrackSim installer."
    elif [ "$fallback_choice" = "2" ]; then
        echo ""
        read -p "Enter Game Data Directory (e.g. /home/user/.../steamapps/common/Euro Truck Simulator 2): " manual_data
        read -p "Enter Wine/Proton Prefix Directory (e.g. /home/user/.../compatdata/227300/pfx): " manual_prefix
        
        echo ""
        echo "Retrying installation with manual paths..."
        node index.js install "$game" --game-dir "$manual_data" --prefix-dir "$manual_prefix"
    fi
fi

echo ""
read -p "Press any key to exit..." -n 1 -s
echo ""
