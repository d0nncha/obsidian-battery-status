# Obsidian Battery Status

Obsidian Battery Status is an experimental desktop-only plugin that displays the battery level of paired Bluetooth devices directly inside the Obsidian status bar.

## Features

- Maintain a list of Bluetooth devices with per-device polling intervals.
- Query device battery levels via a Windows-specific subprocess powered by [`@abandonware/noble`](https://github.com/abandonware/noble).
- Minimal UI with a status bar indicator and settings tab for CRUD management.

## Getting Started (Development)

1. Clone this repository and install dependencies:

   ```bash
   npm install
   ```

2. Build the plugin bundle:

   ```bash
   npm run build
   ```

3. In Obsidian, open **Settings → Community plugins → Load unpacked** and select the generated `dist/` folder.

## Configuration

Use the plugin settings tab to add Bluetooth devices. Each entry requires:

- **Device name** – label shown in the status bar.
- **MAC address** – normalized identifier used to query the battery service.
- **Polling interval (seconds)** – how frequently the subprocess should read the GATT Battery Service (0x180F / 0x2A19).

## Limitations

- Only Windows is supported in v0.1; macOS and Linux adapters are planned.
- Not all Bluetooth devices expose the GATT Battery Service.
- Devices must be paired and reachable from the system running Obsidian.
- `@abandonware/noble` on Windows may require additional tooling (e.g., Visual Studio Build Tools, compatible Bluetooth drivers).

## Roadmap

- Windows WinRT adapter for improved BLE stability.
- Native macOS and Linux platform adapters.
- Bluetooth device scanning UI.
- Embed battery widgets inside notes.
