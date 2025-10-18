import { Plugin } from 'obsidian';
import { BatteryService } from './services/BatteryService';
import { BatterySettingsTab, DEFAULT_SETTINGS, DeviceSetting, PluginSettings } from './settings';
import { platform } from '../platform';
import { StatusBarWidget } from '../ui/statusBar';
import { normalizeId } from '../platform/shared/normalize';

interface DeviceTimer {
  id: string;
  handle: number;
}

export default class ObsidianBatteryStatusPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private statusBarWidget: StatusBarWidget | null = null;
  private batteryService: BatteryService | null = null;
  private deviceTimers: Map<string, DeviceTimer> = new Map();
  private devicePercents: Map<string, number | null> = new Map();

  async onload(): Promise<void> {
    await this.loadSettings();

    this.batteryService = new BatteryService(platform.battery);

    const statusBarItemEl = this.addStatusBarItem();
    this.statusBarWidget = new StatusBarWidget(statusBarItemEl);
    this.statusBarWidget.set([]);

    this.addSettingTab(new BatterySettingsTab(this.app, this));

    this.refreshDeviceTimers();
  }

  onunload(): void {
    this.clearTimers();
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    this.settings.devices = (this.settings.devices ?? []).map((device) => ({
      ...device,
      mac: normalizeId(device.mac ?? ''),
      interval: Math.max(5, Number.parseInt(String(device.interval ?? 300), 10) || 300)
    }));
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.refreshDeviceTimers();
  }

  private clearTimers(): void {
    for (const timer of this.deviceTimers.values()) {
      window.clearInterval(timer.handle);
    }
    this.deviceTimers.clear();
  }

  private refreshDeviceTimers(): void {
    this.clearTimers();
    this.devicePercents.clear();

    const devices = this.settings.devices
      .map((device) => ({
        ...device,
        mac: normalizeId(device.mac)
      }))
      .filter((device) => device.mac.length > 0);

    for (const device of devices) {
      this.scheduleDevice(device);
    }

    this.updateStatusBar();
  }

  private scheduleDevice(device: DeviceSetting): void {
    if (!this.batteryService) return;

    const mac = normalizeId(device.mac);
    if (!mac) {
      return;
    }

    const run = async () => {
      if (!this.batteryService) return;
      const percent = await this.batteryService.getDevicePercent(mac);
      this.devicePercents.set(mac, percent);
      this.updateStatusBar();
    };

    // First tick immediately
    run().catch((error) => console.error('Battery poll failed', error));

    const intervalMs = Math.max(5, device.interval) * 1000;
    const handle = window.setInterval(() => {
      run().catch((error) => console.error('Battery poll failed', error));
    }, intervalMs);

    this.deviceTimers.set(mac, { id: mac, handle });
  }

  private updateStatusBar(): void {
    if (!this.statusBarWidget) {
      return;
    }

    const devices = this.settings.devices.map((device) => {
      const mac = normalizeId(device.mac);
      const percent = mac ? this.devicePercents.get(mac) ?? null : null;
      return {
        name: device.name || mac || 'Device',
        percent
      };
    });

    this.statusBarWidget.set(devices);
  }
}
