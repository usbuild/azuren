@echo off

set exitCode=0

(

echo Dotnetupdate.cmd start
date /t
time /t

if "%IsEmulated%"=="true" (
    echo "Emulated environment; skipping installation"
    goto :EOF
)

REM Determine v4.5 install status
REM http://msdn.microsoft.com/en-us/library/ee942965(v=vs.110).aspx
echo "Determining install status for .Net 4.5"
FOR /F "skip=2 tokens=3" %%i in ('REG QUERY "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Release') DO (
    if %errorlevel%==0 (
        if NOT "%%i"=="" (
            echo ".Net 4.5 is already installed; skipping installation"
            goto skipInstallation
        )
    )
)

REM Checking install status for KB2600211 (superset of the required fix KB983182)
echo "Determining install status for KB2600211"
FOR /F "skip=2 tokens=3" %%i in ('REG QUERY "HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Updates\Microsoft .NET Framework 4 Client Profile\KB2600211" /v ThisVersionInstalled') DO (
    if %errorlevel%==0 (
        if %%i==Y (
            echo "KB2600211 is already installed; skipping installation"
            goto skipInstallation
        )
    )
)

REM Checking install status of KB983182 (WCF performance issues for the .NET Framework 4.0)
echo "Determining install status for KB983182"
FOR /F "skip=2 tokens=3" %%i in ('REG QUERY "HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Updates\Microsoft .NET Framework 4 Client Profile\KB983182" /v ThisVersionInstalled') DO (
    if %errorlevel%==0 (
        if %%i==Y (
            echo "KB983182 is already installed; skipping installation"
            goto skipInstallation
        )
    )
)

echo "KB983182 is not installed; it will be installed"
date /t
time /t
start /w NDP40-KB983182-x64.exe /q /log "%CachingLocalStorePath%"\KB983182.log

echo errorlevel is %errorlevel%
date /t
time /t

) >> "%CachingLocalStorePath%"\Dotnetupdate.cmd.log 2>&1

set exitCode=%errorlevel%

:skipInstallation

exit /b %exitCode%
