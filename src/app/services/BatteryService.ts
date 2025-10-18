import { BatteryPort } from '../ports/BatteryPort';

export class BatteryService {
  constructor(private readonly batteryPort: BatteryPort) {}

  getDevicePercent(deviceId: string): Promise<number | null> {
    return this.batteryPort.getBatteryLevel(deviceId);
  }

  getAllPercents(deviceIds: string[]): Promise<Record<string, number | null>> {
    return this.batteryPort.getManyBatteryLevels(deviceIds);
  }
}
