#!/bin/bash

# Get the actual home directory of the user running sudo
if [ "$EUID" -eq 0 ]; then
    USER_HOME=$(eval echo "~$SUDO_USER")
else
    USER_HOME="$HOME"
fi

# Define source and target directories
SOURCE_DIR=$(pwd) # Assumes script is run from the folder containing the files
TARGET_BIN_DIR="/usr/local/bin/snapshot/launcher"
TARGET_DESKTOP_DIR="$USER_HOME/.local/share/applications"

# Create target directories if they don't exist
mkdir -p "$TARGET_BIN_DIR"
mkdir -p "$TARGET_DESKTOP_DIR"

# Copy apps.sh and icon.png to /usr/local/bin/snapshot/launcher/
echo "Copying apps.sh and icon.png to $TARGET_BIN_DIR..."
cp "$SOURCE_DIR/apps.sh" "$SOURCE_DIR/icon.png" "$TARGET_BIN_DIR" || {
    echo "Error copying files to $TARGET_BIN_DIR."
    exit 1
}

# Copy the desktop file to ~/.local/share/applications
echo "Copying snapshot.launcher.desktop to $TARGET_DESKTOP_DIR..."
cp "$SOURCE_DIR/snapshot.launcher.desktop" "$TARGET_DESKTOP_DIR" || {
    echo "Error copying desktop file to $TARGET_DESKTOP_DIR."
    exit 1
}

# Make apps.sh executable
echo "Making apps.sh executable..."
chmod +x "$TARGET_BIN_DIR/apps.sh" || {
    echo "Error setting execute permission on apps.sh."
    exit 1
}

# Provide feedback on success
echo "Files successfully copied and apps.sh made executable!"
