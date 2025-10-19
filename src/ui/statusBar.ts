import { setIcon } from 'obsidian';

export interface StatusBarDeviceState {
  name: string;
  percent: number | null;
}

type BatteryIconName = 'battery-full' | 'battery-low' | 'battery-medium' | 'battery-warning';

export class StatusBarWidget {
  constructor(private readonly containerEl: HTMLElement) {
    this.containerEl.classList.add('obsidian-battery-status');
  }

  set(devices: StatusBarDeviceState[]): void {
    this.containerEl.empty();

    if (!devices.length) {
      const emptyEl = this.containerEl.createSpan({ cls: 'obsidian-battery-status__empty' });
      emptyEl.appendChild(this.createIcon('battery-warning'));
      emptyEl.createSpan({ text: 'No devices' });
      return;
    }

    devices.forEach(({ name, percent }, index) => {
      const deviceEl = this.containerEl.createSpan({ cls: 'obsidian-battery-status__device' });
      deviceEl.appendChild(this.createIcon(this.resolveIcon(percent)));

      const value = percent == null ? '—%' : `${percent}%`;
      deviceEl.createSpan({ text: `${name}: ${value}` });

      if (index < devices.length - 1) {
        this.containerEl.createSpan({ cls: 'obsidian-battery-status__separator', text: ' | ' });
      }
    });
  }

  private resolveIcon(percent: number | null): BatteryIconName {
    if (percent == null) {
      return 'battery-warning';
    }

    if (percent < 15) {
      return 'battery-low';
    }

    if (percent < 75) {
      return 'battery-medium';
    }

    return 'battery-full';
  }

  private createIcon(name: BatteryIconName): HTMLElement {
    const iconEl = document.createElement('span');
    iconEl.addClass('obsidian-battery-status__icon');
    setIcon(iconEl, name);
    iconEl.style.opacity = '0.9';
    return iconEl;
  }
}
