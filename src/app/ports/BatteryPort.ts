export interface BatteryPort {
  getBatteryLevel(deviceId: string): Promise<number | null>;
  getManyBatteryLevels(deviceIds: string[]): Promise<Record<string, number | null>>;
  supports(deviceId: string): Promise<boolean>;
}
