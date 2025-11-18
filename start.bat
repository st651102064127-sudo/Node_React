@echo off
echo Starting React and Node servers...

REM Start React App in a new window
START "React App" cmd /k "cd react && npm run dev"

REM Start Node Server in a new window
START "Node Server" cmd /k "cd node && npm run dev"

echo Both servers are starting in separate windows.