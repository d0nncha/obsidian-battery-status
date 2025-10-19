#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const noble = require('@abandonware/noble');

const BATTERY_SERVICE_UUID = '180f';
const BATTERY_LEVEL_CHAR_UUID = '2a19';
const DEFAULT_TIMEOUT_MS = 30000;

function parseArgs(argv) {
  const addrIndex = argv.indexOf('--addr');
  const idIndex = argv.indexOf('--id');
  const addr = (addrIndex !== -1 && argv[addrIndex + 1]) ? argv[addrIndex + 1].toLowerCase() : null;
  const id = (idIndex !== -1 && argv[idIndex + 1]) ? argv[idIndex + 1].toLowerCase() : null;
  return { addr, id };
}

async function readBattery(target) {
  if (!target.addr && !target.id) {
    throw new Error('Missing --addr or --id argument');
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

      try { noble.stopScanning(); } catch (_) {}

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
      const uuid = (peripheral.uuid || '').toLowerCase();
      const match =
        (target.addr && address && address === target.addr) ||
        (target.id && uuid && uuid === target.id);
      if (!match) {
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
          // ВАЖНО: скан без фильтра — иначе устройства,
          // не рекламирующие 0x180F, не попадут в discover.
          await noble.startScanningAsync([], false);
        } catch (error) {
          finalize(error);
        }
      } else {
        try { noble.stopScanning(); } catch (_) {}
      }
    });
  });
}

(async () => {
  try {
    const target = parseArgs(process.argv.slice(2));
    const percent = await readBattery(target);
    process.stdout.write(`${percent}`);
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();
