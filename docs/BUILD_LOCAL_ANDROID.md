# Build Local Android APK

Este documento describe el build local de Android probado en esta PC para generar un APK interno sin usar EAS cloud y sin modificar el repo original.

## Objetivo

- Generar un APK instalable para pruebas internas.
- Incluir el estado actual del workspace, incluso cambios locales sin commit.
- Evitar regenerar o limpiar el repo original.
- Usar una copia temporal en `C:\tmp\gastos-mobile-local-build`.

Artefacto esperado:

```powershell
C:\tmp\gastos-mobile-local-build\artifacts\expense-control-v1.0.14-15-internal.apk
```

## Prerequisitos

Herramientas usadas en el build local:

- Node `20.19.4` instalado con `fnm`.
- JDK 17 portable en `C:\tmp\gastos-mobile-tools\jdk17`.
- Android SDK portable en `C:\tmp\gastos-mobile-tools\android-sdk`.
- Android SDK packages:
  - `platform-tools`
  - `platforms;android-36`
  - `build-tools;36.0.0`
  - `ndk;27.1.12297006`

Comprobar versiones:

```powershell
$nodeHome = "$env:APPDATA\fnm\node-versions\v20.19.4\installation"
$env:JAVA_HOME = "C:\tmp\gastos-mobile-tools\jdk17"
$env:ANDROID_HOME = "C:\tmp\gastos-mobile-tools\android-sdk"
$env:ANDROID_SDK_ROOT = "C:\tmp\gastos-mobile-tools\android-sdk"
$env:Path = "$nodeHome;$env:JAVA_HOME\bin;$env:ANDROID_SDK_ROOT\platform-tools;$env:ANDROID_SDK_ROOT\cmdline-tools\latest\bin;$env:Path"

node -v
npm -v
java -version
sdkmanager --list_installed
```

## Preparar Tools Locales

Instalar Node con `fnm`:

```powershell
fnm install 20.19.4
```

Descargar e instalar JDK 17 portable:

```powershell
$toolsRoot = "C:\tmp\gastos-mobile-tools"
$jdkRoot = "$toolsRoot\jdk17"
$zip = "$toolsRoot\temurin17.zip"
$extract = "$toolsRoot\jdk17-extract"

New-Item -ItemType Directory -Force -Path $toolsRoot, $jdkRoot | Out-Null
Invoke-WebRequest -Uri "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk" -OutFile $zip

if (Test-Path $extract) { Remove-Item -LiteralPath $extract -Recurse -Force }
Expand-Archive -LiteralPath $zip -DestinationPath $extract -Force

$jdkDir = Get-ChildItem $extract -Directory | Select-Object -First 1
if (Test-Path $jdkRoot) { Remove-Item -LiteralPath $jdkRoot -Recurse -Force }
Move-Item -LiteralPath $jdkDir.FullName -Destination $jdkRoot
```

Descargar Android command-line tools:

```powershell
$toolsRoot = "C:\tmp\gastos-mobile-tools"
$sdkRoot = "$toolsRoot\android-sdk"
$zip = "$toolsRoot\commandlinetools-win.zip"
$extract = "$toolsRoot\cmdline-tools-extract"
$latest = "$sdkRoot\cmdline-tools\latest"

New-Item -ItemType Directory -Force -Path $toolsRoot, $sdkRoot | Out-Null
Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-13114758_latest.zip" -OutFile $zip

if (Test-Path $extract) { Remove-Item -LiteralPath $extract -Recurse -Force }
Expand-Archive -LiteralPath $zip -DestinationPath $extract -Force

if (Test-Path $latest) { Remove-Item -LiteralPath $latest -Recurse -Force }
New-Item -ItemType Directory -Force -Path (Split-Path $latest) | Out-Null
Move-Item -LiteralPath "$extract\cmdline-tools" -Destination $latest
```

Aceptar licencias e instalar paquetes Android:

```powershell
$env:JAVA_HOME = "C:\tmp\gastos-mobile-tools\jdk17"
$env:ANDROID_HOME = "C:\tmp\gastos-mobile-tools\android-sdk"
$env:ANDROID_SDK_ROOT = "C:\tmp\gastos-mobile-tools\android-sdk"
$sdkmanager = "$env:ANDROID_SDK_ROOT\cmdline-tools\latest\bin\sdkmanager.bat"

(("y" + [Environment]::NewLine) * 20) | & $sdkmanager --sdk_root=$env:ANDROID_SDK_ROOT --licenses
& $sdkmanager --sdk_root=$env:ANDROID_SDK_ROOT "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"
```

## Crear Copia Temporal

Desde la raiz del repo:

```powershell
$source = (Resolve-Path ".").Path
$target = "C:\tmp\gastos-mobile-local-build"

if (Test-Path $target) {
  Remove-Item -LiteralPath $target -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $target | Out-Null
robocopy $source $target /E /XD .git node_modules mobile\node_modules mobile\.expo mobile\android mobile\dev-local /NFL /NDL /NJH /NJS /NP

if (Test-Path "$target\mobile\android") {
  Remove-Item -LiteralPath "$target\mobile\android" -Recurse -Force
}
```

## Instalar Dependencias y Validar

```powershell
$nodeHome = "$env:APPDATA\fnm\node-versions\v20.19.4\installation"
$env:Path = "$nodeHome;$env:Path"

Set-Location "C:\tmp\gastos-mobile-local-build\mobile"
npm ci
npx tsc --noEmit
npm test
```

Salida esperada de tests:

```text
Test Files  3 passed (3)
Tests  21 passed (21)
```

## Generar Android Nativo

```powershell
$nodeHome = "$env:APPDATA\fnm\node-versions\v20.19.4\installation"
$env:Path = "$nodeHome;$env:Path"

Set-Location "C:\tmp\gastos-mobile-local-build\mobile"
npx expo prebuild --platform android --clean --no-install
```

Notas esperadas:

- Expo puede avisar que no hay repo git en la copia temporal.
- Expo puede avisar que `edgeToEdgeEnabled=false` no se puede desactivar en Android 16+.
- Esos avisos no bloquean el build.

## Compilar APK Release

```powershell
$nodeHome = "$env:APPDATA\fnm\node-versions\v20.19.4\installation"
$env:JAVA_HOME = "C:\tmp\gastos-mobile-tools\jdk17"
$env:ANDROID_HOME = "C:\tmp\gastos-mobile-tools\android-sdk"
$env:ANDROID_SDK_ROOT = "C:\tmp\gastos-mobile-tools\android-sdk"
$env:Path = "$nodeHome;$env:JAVA_HOME\bin;$env:ANDROID_SDK_ROOT\platform-tools;$env:ANDROID_SDK_ROOT\cmdline-tools\latest\bin;$env:Path"

Set-Location "C:\tmp\gastos-mobile-local-build\mobile\android"
.\gradlew.bat --no-daemon --console=plain clean assembleRelease
```

Salida esperada:

```text
BUILD SUCCESSFUL
```

APK generado por Gradle:

```powershell
C:\tmp\gastos-mobile-local-build\mobile\android\app\build\outputs\apk\release\app-release.apk
```

## Copiar Artefacto Final

```powershell
$artifactDir = "C:\tmp\gastos-mobile-local-build\artifacts"
$sourceApk = "C:\tmp\gastos-mobile-local-build\mobile\android\app\build\outputs\apk\release\app-release.apk"
$targetApk = "$artifactDir\expense-control-v1.0.14-15-internal.apk"

New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
Copy-Item -LiteralPath $sourceApk -Destination $targetApk -Force
Get-Item -LiteralPath $targetApk | Select-Object Name, Length, FullName
```

Validar:

- El archivo existe.
- `Length` es mayor que `0`.
- En el ultimo build probado, el APK peso `68,547,454` bytes.

## Troubleshooting

- Si `vitest` falla por `@rolldown/binding-win32-x64-msvc`, confirmar que se esta usando Node `20.19.4` o superior.
- Si `sdkmanager` no instala paquetes, ejecutar primero `--licenses`.
- Si Gradle no encuentra SDK, confirmar `ANDROID_HOME` y `ANDROID_SDK_ROOT`.
- Si Gradle usa Java 21 por error, confirmar `JAVA_HOME=C:\tmp\gastos-mobile-tools\jdk17`.
- No commitear APKs, keystores ni carpetas generadas de build.
