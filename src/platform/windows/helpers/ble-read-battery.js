#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const noble = require('@abandonware/noble');

const BATTERY_SERVICE_UUID = '180f';
const BATTERY_LEVEL_CHAR_UUID = '2a19';
const DEFAULT_TIMEOUT_MS = 20000;

function parseArgs(argv) {
  const addrIndex = argv.indexOf('--addr');
  if (addrIndex !== -1 && argv[addrIndex + 1]) {
    return argv[addrIndex + 1].toLowerCase();
  }
  return null;
}

async function readBattery(targetAddress) {
  if (!targetAddress) {
    throw new Error('Missing --addr argument');
  }

  return new Promise((resolve, reject) => {
    let timeout = null;
    let settled = false;

    function finalize(error, value) {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      noble.removeAllListeners('discover');
      noble.removeAllListeners('stateChange');
      noble.stopScanning().catch(() => {});
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    }

    timeout = setTimeout(() => {
      finalize(new Error('BLE read timeout'));
    }, DEFAULT_TIMEOUT_MS);

    noble.on('discover', async (peripheral) => {
      const address = (peripheral.address || '').toLowerCase();
      if (address !== targetAddress) {
        return;
      }

      try {
        await noble.stopScanningAsync();
        await peripheral.connectAsync();
        const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
          [BATTERY_SERVICE_UUID],
          [BATTERY_LEVEL_CHAR_UUID]
        );

        if (!characteristics || characteristics.length === 0) {
          throw new Error('Battery characteristic not found');
        }

        const characteristic = characteristics[0];
        const data = await characteristic.readAsync();
        const percent = data.readUInt8(0);
        await peripheral.disconnectAsync().catch(() => {});
        finalize(null, percent);
      } catch (error) {
        finalize(error);
      }
    });

    noble.on('stateChange', async (state) => {
      if (state === 'poweredOn') {
        try {
          await noble.startScanningAsync([BATTERY_SERVICE_UUID], false);
        } catch (error) {
          finalize(error);
        }
      } else {
        noble.stopScanning().catch(() => {});
      }
    });
  });
}

(async () => {
  try {
    const address = parseArgs(process.argv.slice(2));
    const percent = await readBattery(address);
    process.stdout.write(`${percent}`);
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();
