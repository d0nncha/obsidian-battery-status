import { ScanPort, ScanResult } from '../../app/ports/ScanPort';

export function createScanStub(): ScanPort {
  return {
    async scan(_timeoutMs: number): Promise<ScanResult[]> {
      return [];
    }
  };
}
