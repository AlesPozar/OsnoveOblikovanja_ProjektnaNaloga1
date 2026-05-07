@echo off
cd /d "C:\Users\Uporabnuiki\Desktop\OO\CSGO\testDataset\frontend\b_FDcf4ODOt91"
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev -- --hostname 127.0.0.1 --port 3000 > dev-server.out.log 2> dev-server.err.log
