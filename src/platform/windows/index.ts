import { BatteryPort } from '../../app/ports/BatteryPort';
import { ScanPort } from '../../app/ports/ScanPort';
import { PlatformInfoPort } from '../../app/ports/PlatformInfoPort';
import { createBatterySubprocessPort } from './battery.ble_subprocess';
import { createScanStub } from './scan.stub';

export interface WindowsPlatform {
  battery: BatteryPort;
  scan: ScanPort;
  info: PlatformInfoPort;
}

export function createWindowsPlatform(): WindowsPlatform {
  const battery = createBatterySubprocessPort();
  const scan = createScanStub();
  const info: PlatformInfoPort = {
    os: 'windows',
    capabilities: {
      ble: true,
      subprocess: true
    }
  };

  return { battery, scan, info };
}
