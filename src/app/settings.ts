import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type ObsidianBatteryStatusPlugin from './main';
import { normalizeId } from '../platform/shared/normalize';

export interface DeviceSetting {
  name: string;
  mac: string;
}

export interface PluginSettings {
  devices: DeviceSetting[];
  interval: number;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  devices: [],
  interval: 300
};

export class BatterySettingsTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: ObsidianBatteryStatusPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName('Polling interval')
      .setDesc('Bluetooth device polling interval in seconds.')
      .addText((text) =>
      text
        .setPlaceholder('Interval (seconds)')
        .setValue(String(this.plugin.settings.interval))
        .onChange(async (value) => {
          const parsed = Number.parseInt(value, 10);
          if (!Number.isNaN(parsed) && parsed > 0) {
            this.plugin.settings.interval = parsed;
            await this.plugin.saveSettings();
          } else {
            new Notice('Interval must be a positive number.');
          }
        }))
      .addExtraButton((button) =>
        button
          .setIcon('timer')
      );

    this.plugin.settings.devices.forEach((device, index) => {
      const deviceSetting = new Setting(containerEl)
        .setName(device.name || `Device ${index + 1}`)
        .setDesc('Configure the name and MAC address.');

      deviceSetting.addText((text) =>
        text
          .setPlaceholder('Device name')
          .setValue(device.name)
          .onChange(async (value) => {
            device.name = value.trim();
            await this.plugin.saveSettings();
            this.display();
          })
      );

      deviceSetting.addText((text) =>
        text
          .setPlaceholder('MAC address (AA:BB:CC:DD:EE:FF)')
          .setValue(device.mac)
          .onChange(async (value) => {
            device.mac = normalizeId(value);
            await this.plugin.saveSettings();
          })
      );

      deviceSetting.addExtraButton((button) =>
        button
          .setIcon('trash')
          .setTooltip('Remove device')
          .onClick(async () => {
            this.plugin.settings.devices.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          })
      );
    });

    new Setting(containerEl)
      .setName('Add device')
      .setDesc('Create a new device entry for battery polling.')
      .addButton((button) =>
        button
          .setButtonText('Add')
          .onClick(async () => {
            this.plugin.settings.devices.push({
              name: '',
              mac: '',
            });
            await this.plugin.saveSettings();
            this.display();
          })
      );
  }
}
