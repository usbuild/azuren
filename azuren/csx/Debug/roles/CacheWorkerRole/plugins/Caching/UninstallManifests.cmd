@echo on

%windir%\system32\unlodctr.exe /m:Microsoft.ApplicationServer.Caching.PerformanceCounter.man
%windir%\system32\wevtutil.exe um Microsoft.WindowsFabric.EventDefinitions.man
%windir%\system32\wevtutil.exe um Microsoft.ApplicationServer.Caching.EventDefinitions.man
%windir%\system32\wevtutil.exe um Microsoft.ApplicationServer.Caching.TracingEventDefinitions.man
%windir%\system32\wevtutil.exe um Microsoft.ApplicationServer.EventDefinitions.man
REG DELETE "HKLM\SOFTWARE\Microsoft\Microsoft SDKs\Windows Azure Libraries for .NET" /v LastCachingManifestInstallVersion /f
"%programfiles%\Microsoft SDKs\Windows Azure\.NET SDK\2012-10\ref\caching\ClientPerfCountersInstaller.exe" uninstall
exit /b 0