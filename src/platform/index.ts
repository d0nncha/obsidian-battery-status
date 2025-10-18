import { PlatformContext } from './types';
import { createWindowsPlatform, WindowsPlatform } from './windows/index';

export type Platform = WindowsPlatform;

let platformInstance: Platform | null = null;

export function initializePlatform(context: PlatformContext): Platform {
  platformInstance = createWindowsPlatform(context);
  return platformInstance;
}

export function getPlatform(): Platform {
  if (!platformInstance) {
    throw new Error('Platform has not been initialized');
  }

  return platformInstance;
}
