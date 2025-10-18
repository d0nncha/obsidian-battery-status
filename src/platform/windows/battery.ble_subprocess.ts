import path from 'path';
import { BatteryPort } from '../../app/ports/BatteryPort';
import { runNodeScript } from '../shared/cli';
import { normalizeId } from '../shared/normalize';

const helperScriptPath = path.join(__dirname, 'helpers', 'ble-read-battery.js');

async function readBatteryLevel(deviceId: string): Promise<number | null> {
  const normalized = normalizeId(deviceId);
  if (!normalized) {
    return null;
  }

  try {
    const { stdout } = await runNodeScript(helperScriptPath, ['--addr', normalized]);
    const trimmed = stdout.trim();
    const parsed = Number.parseInt(trimmed, 10);

    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to read battery level', error);
    return null;
  }
}

export function createBatterySubprocessPort(): BatteryPort {
  return {
    async getBatteryLevel(deviceId: string): Promise<number | null> {
      return readBatteryLevel(deviceId);
    },
    async getManyBatteryLevels(deviceIds: string[]): Promise<Record<string, number | null>> {
      const results: Record<string, number | null> = {};

      for (const id of deviceIds) {
        results[id] = await readBatteryLevel(id);
      }

      return results;
    },
    async supports(deviceId: string): Promise<boolean> {
      return normalizeId(deviceId).length > 0;
    }
  };
}
