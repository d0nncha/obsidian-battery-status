export interface ScanResult {
  id: string;
  name?: string;
}

export interface ScanPort {
  scan(timeoutMs: number): Promise<ScanResult[]>;
}
