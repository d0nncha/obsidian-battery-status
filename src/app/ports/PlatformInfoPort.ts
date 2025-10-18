export type PlatformKind = 'windows' | 'macos' | 'linux';

export interface PlatformInfoPort {
  os: PlatformKind;
  capabilities: Record<string, boolean | undefined>;
}
