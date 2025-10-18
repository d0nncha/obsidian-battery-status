import { BatteryPort } from '../../app/ports/BatteryPort';
import { ScanPort } from '../../app/ports/ScanPort';
import { PlatformInfoPort } from '../../app/ports/PlatformInfoPort';
import { PlatformContext } from '../types';
import { createBatterySubprocessPort } from './battery.ble_subprocess';
import { createScanStub } from './scan.stub';

export interface WindowsPlatform {
  battery: BatteryPort;
  scan: ScanPort;
  info: PlatformInfoPort;
}

export function createWindowsPlatform(context: PlatformContext): WindowsPlatform {
  const battery = createBatterySubprocessPort(context);
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
