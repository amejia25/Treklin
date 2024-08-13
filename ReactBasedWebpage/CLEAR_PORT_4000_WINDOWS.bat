@echo off
setlocal EnableDelayedExpansion

:: Replace YOURPORT with the actual port number you're interested in.
set "port=4000"
set "processFound=false"

echo Finding process using port %port%...

:: Corrected to use a single findstr to filter both LISTENING and ESTABLISHED states
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":%port% .*LISTENING" /C:":%port% .*ESTABLISHED"') do (
    set "pid=%%a"
    set "processFound=true"
    echo Found process with PID: !pid!
    
    :: Attempt to kill the process by PID
    for /f "tokens=1" %%i in ('tasklist /nh /fi "pid eq !pid!"') do (
        set "processName=%%i"
        echo Attempting to kill process !processName! with PID !pid!...
        taskkill /f /pid !pid!
    )
)

if "!processFound!"=="false" (
    echo No process found...
) else (
    echo Process possibly terminated.
)

echo Press any key to exit.
pause >nul

