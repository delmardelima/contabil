@echo off
set "INCLUDE=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\include;C:\Users\atend\winsdk_headers\c\Include\10.0.28000.0\um;C:\Users\atend\winsdk_headers\c\Include\10.0.28000.0\shared;C:\Users\atend\winsdk_headers\c\Include\10.0.28000.0\ucrt;C:\Users\atend\winsdk_headers\c\Include\10.0.28000.0\winrt;%INCLUDE%"
set "LIB=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\lib\x64;C:\Users\atend\winsdk_libs\c\um\x64;C:\Users\atend\winsdk_libs\c\ucrt\x64;%LIB%"
set "RC=C:\Users\atend\winsdk_headers\c\bin\10.0.28000.0\x64\rc.exe"
set "PATH=C:\Users\atend\winsdk_headers\c\bin\10.0.28000.0\x64;C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64;C:\Users\atend\.cargo\bin;%PATH%"

call npx tauri %*
