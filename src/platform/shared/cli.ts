import { spawn, execFileSync } from 'child_process';
import * as os from 'os';

export interface RunNodeScriptResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: NodeJS.Signals | null;
}

/** Пытаемся найти system Node.js (а не Electron/Obsidian). */
function resolveNodeBinary(): string {
  // 1) если задали явно через переменную окружения — используем её
  if (process.env.OBS_BAT_NODE_BIN) return process.env.OBS_BAT_NODE_BIN;

  // 2) на Windows попробуем "where node"
  if (process.platform === 'win32') {
    try {
      const out = execFileSync('where', ['node'], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .split(/\r?\n/)
        .map(s => s.trim())
        .find(Boolean);
      if (out) return out;
    } catch {}
    // запасной вариант — стандартные места установки
    const guesses = [
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe'
    ];
    for (const g of guesses) {
      try { execFileSync(g, ['-v'], { windowsHide: true }); return g; } catch {}
    }
  }

  // 3) на *nix/и вообще — пусть shell найдёт "node"
  return 'node';
}

export function runNodeScript(
  scriptPath: string,
  args: string[] = [],
  timeoutMs = 15000
): Promise<RunNodeScriptResult> {
  return new Promise((resolve, reject) => {
    const nodeBin = resolveNodeBinary();

    let stdout = '';
    let stderr = '';
    let finished = false;

    const child = spawn(nodeBin, [scriptPath, ...args], {
      cwd: process.cwd(),
      env: { ...process.env },
      windowsHide: true,               // не мигает консоль под Windows
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const timeout = setTimeout(() => {
      if (finished) return;
      finished = true;

      child.kill('SIGTERM');
      if (process.platform !== 'win32') {
        setTimeout(() => child.kill('SIGKILL'), 1000);
      }

      resolve({ stdout, stderr: (stderr + '\n(timeout)').trim(), code: null, signal: 'SIGTERM' as any });
    }, timeoutMs);

    child.stdout?.on('data', (d) => (stdout += d.toString()));
    child.stderr?.on('data', (d) => (stderr += d.toString()));

    child.on('error', (error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      reject(error);
    });

    child.on('close', (code, signal) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      resolve({ stdout, stderr, code, signal });
    });
  });
}
