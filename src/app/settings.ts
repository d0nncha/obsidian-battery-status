import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type ObsidianBatteryStatusPlugin from './main';
import { normalizeId } from '../platform/shared/normalize';

export interface DeviceSetting {
  name: string;
  mac: string;
  interval: number;
}

export interface PluginSettings {
  devices: DeviceSetting[];
}

export const DEFAULT_SETTINGS: PluginSettings = {
  devices: []
};

export class BatterySettingsTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: ObsidianBatteryStatusPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Bluetooth Devices' });

    if (!this.plugin.settings.devices.length) {
      containerEl.createEl('p', { text: 'Add a device to begin tracking its battery level.' });
    }

    this.plugin.settings.devices.forEach((device, index) => {
      const deviceSetting = new Setting(containerEl)
        .setName(device.name || `Device ${index + 1}`)
        .setDesc('Configure the name, MAC address, and polling interval.');

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

      deviceSetting.addText((text) =>
        text
          .setPlaceholder('Interval (seconds)')
          .setValue(String(device.interval))
          .onChange(async (value) => {
            const parsed = Number.parseInt(value, 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
              device.interval = parsed;
              await this.plugin.saveSettings();
            } else {
              new Notice('Interval must be a positive number.');
            }
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
              name: 'New device',
              mac: '',
              interval: 300
            });
            await this.plugin.saveSettings();
            this.display();
          })
      );
  }
}
