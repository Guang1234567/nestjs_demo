import { exec } from 'child_process';
import path from 'path';
import { platform as getPlatform } from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import http from 'http';
import { Option, program } from 'commander';

/**
 * 跨平台启动 Chrome 或 Edge 浏览器的调试模式 (适配 NestJS 项目)
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../');

program
  .addOption(
    new Option('--browser <type>', 'browser type (chrome/msedge)')
      .choices(['chrome', 'msedge'])
      .default('chrome', 'The browser used to debug.'),
  )
  .addOption(
    new Option('--port <number>', 'browser debug port')
      .default(9900, '(default: 9900)')
      .argParser((current) => parseInt(current, 10)),
  )
  .addOption(
    new Option('--mode <mode>', 'env mode (development/production)')
      .choices(['development', 'production'])
      .default('development'),
  )
  .addOption(new Option('--path <path>', 'app relative path').default(''))
  .parse(process.argv);

interface BrowserOption {
  browser: 'chrome' | 'msedge';
  port: number;
  mode: 'development' | 'production';
  path: string;
}

const options = program.opts<BrowserOption>();

/**
 * 简单的 .env 文件解析器
 */
function loadEnvFromDotenv(mode: string): Record<string, string> {
  const envFilePath = path.join(workspaceRoot, `.env.${mode}`);
  if (!fs.existsSync(envFilePath)) {
    console.warn(`[Browser] Warning: ${envFilePath} not found.`);
    return {};
  }

  const content = fs.readFileSync(envFilePath, 'utf-8');
  const env: Record<string, string> = {};

  content.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...values] = trimmedLine.split('=');
      if (key && values.length > 0) {
        env[key.trim()] = values.join('=').trim();
      }
    }
  });

  return env;
}

// 加载环境配置
const env = loadEnvFromDotenv(options.mode);

const browser = options.browser.toLowerCase();
const browserDebugPort: number = options.port;

// 优先从 .env 读取 PORT，默认 3000
const appPort = env.PORT || '3000';
const relativePath = options.path.startsWith('/')
  ? options.path.substring(1)
  : options.path;
const url = `http://localhost:${appPort}/${relativePath}`;

const platform = getPlatform();
const userDataDir = path.join(
  workspaceRoot,
  'tools/.debug/remote-debug-profile',
);

if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir, { recursive: true });
}

const browserArgs: string[] = [
  '--bwsi', // 禁止登录同步
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--enable-automation',
  `--remote-debugging-port=${browserDebugPort}`,
  `--user-data-dir=${userDataDir}`,
  url,
];

function checkPortReady(targetUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(targetUrl, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
  });
}

function checkDebugPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/json/version`, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
  });
}

/*
function monitorBrowser(debugPort: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const monitor = setInterval(() => {
      checkDebugPort(debugPort)
        .then((isAlive) => {
          if (!isAlive) {
            console.log(
              `[Browser] Was closed (Debug port ${debugPort} inactive). Exiting...`,
            );
            clearInterval(monitor);
            resolve();
          }
        })
        .catch((err) => {
          console.error(`[Browser] Error monitoring debug port: ${err}`);
        });
    }, 1000);
  });
}
*/

async function launch() {
  console.log(`[Browser] Target App URL: ${url}`);
  console.log(`[Browser] Waiting for NestJS server ${url}...`);

  // 1. 先等待 NestJS 服务就绪
  while (!(await checkPortReady(url))) {
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log(`[Browser] NestJS server is ready.`);

  console.log(
    `[Browser] Starting browser on debug port ${browserDebugPort}...`,
  );

  // 2. 检查调试端口是否已经在使用中
  const isPortInUse = await checkDebugPort(browserDebugPort);
  if (isPortInUse) {
    console.log(
      `[Browser] Debug port ${browserDebugPort} is already active. Assuming browser is already running. Skipping launch.`,
    );
    //await monitorBrowser(browserDebugPort);
    return;
  }

  // 3. 启动浏览器
  let command = '';
  if (platform === 'win32') {
    const executable = browser === 'chrome' ? 'chrome' : 'msedge';
    const argListStr = browserArgs.map((arg) => `"${arg}"`).join(', ');
    command = `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '${executable}' -ArgumentList ${argListStr} -PassThru"`;
  } else {
    const appName = browser === 'chrome' ? 'Google Chrome' : 'Microsoft Edge';
    command =
      platform === 'darwin'
        ? `open -a "${appName}" --args ${browserArgs.join(' ')}`
        : `${browser === 'chrome' ? 'google-chrome-stable' : 'microsoft-edge-stable'} ${browserArgs.join(' ')} &`;
  }

  exec(command);

  while (!(await checkDebugPort(browserDebugPort))) {
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(
    `[Browser] Started. Monitoring debug port ${browserDebugPort}...`,
  );
  //await monitorBrowser(browserDebugPort);
}

launch().catch((err) => {
  console.error(`[Browser] Launch Failed:`, err);
  process.exit(1);
});
