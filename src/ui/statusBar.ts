export interface StatusBarDeviceState {
  name: string;
  percent: number | null;
}

export class StatusBarWidget {
  constructor(private readonly containerEl: HTMLElement) {
    this.containerEl.classList.add('obsidian-battery-status');
  }

  set(devices: StatusBarDeviceState[]): void {
    if (!devices.length) {
      this.containerEl.setText('🔋 No devices');
      return;
    }

    const parts = devices.map(({ name, percent }) => {
      const value = percent == null ? '—%' : `${percent}%`;
      return `${name}: ${value}`;
    });

    this.containerEl.setText(`🔋 ${parts.join(' | ')}`);
  }
}
