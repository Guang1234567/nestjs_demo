@echo off
setlocal

@rem echo [Command] pnpm jiti "%~dp0..\script\serve-launch_debuggable_browser.ts" %* --
pnpm jiti "%~dp0..\script\launch_debuggable_browser.ts" %* --

endlocal
