@echo on

%windir%\system32\unlodctr.exe /m:Microsoft.ApplicationServer.Caching.PerformanceCounter.man
%windir%\system32\wevtutil.exe um Microsoft.WindowsFabric.EventDefinitions.man
%windir%\system32\wevtutil.exe um Microsoft.ApplicationServer.Caching.EventDefinitions.man
%windir%\system32\wevtutil.exe um Microsoft.ApplicationServer.Caching.TracingEventDefinitions.man
%windir%\system32\wevtutil.exe um Microsoft.ApplicationServer.EventDefinitions.man


%windir%\system32\lodctr.exe /m:Microsoft.ApplicationServer.Caching.PerformanceCounter.man
if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: lodctr.exe failed with error %ERRORLEVEL% 1>&2
        exit /b 2
    )
%windir%\system32\wevtutil.exe im Microsoft.ApplicationServer.EventDefinitions.man
if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: wevtutil.exe im Microsoft.ApplicationServer.EventDefinitions.man failed with error %ERRORLEVEL% 1>&2
        exit /b 2
    )
%windir%\system32\wevtutil.exe im Microsoft.ApplicationServer.Caching.EventDefinitions.man
if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: wevtutil.exe im Microsoft.ApplicationServer.Caching.EventDefinitions.man failed with error %ERRORLEVEL% 1>&2
        exit /b 2
    )
%windir%\system32\wevtutil.exe im Microsoft.ApplicationServer.Caching.TracingEventDefinitions.man
if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: wevtutil.exe im Microsoft.ApplicationServer.Caching.TracingEventDefinitions.man failed with error %ERRORLEVEL% 1>&2
        exit /b 2
    )
%windir%\system32\wevtutil.exe im Microsoft.WindowsFabric.EventDefinitions.man
if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: wevtutil.exe im Microsoft.WindowsFabric.EventDefinitions.man failed with error %ERRORLEVEL% 1>&2
        exit /b 2
    )


echo "SUCCESS: INSTALLED CACHE MANIFEST"
exit /b 0
