#!/bin/bash

rm workbench*

deno compile --allow-net --target x86_64-unknown-linux-gnu --output workbench-signal-server-linux index.js
7z a workbench-signal-server-linux.7z workbench-signal-server-linux

deno compile --allow-net --target x86_64-pc-windows-msvc --output workbench-signal-server index.js
7z a workbench-signal-server.exe.7z workbench-signal-server.exe

deno compile --allow-net --target x86_64-apple-darwin --output workbench-signal-server-apple-x86_64 index.js
7z a workbench-signal-server-apple-x86_64.7z workbench-signal-server-apple-x86_64

deno compile --allow-net --target aarch64-apple-darwin --output workbench-signal-server-apple-aarch64 index.js
7z a workbench-signal-server-apple-aarch64 workbench-signal-server-apple-aarch64.7z
