$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Join-Path $projectRoot "HelloWorld.csproj"
$outputPath = Join-Path $projectRoot "bin\\Debug\\net9.0\\HelloWorld.dll"

function Get-LatestSourceWriteTime {
    $files = Get-ChildItem $projectRoot -Recurse -File | Where-Object {
        $_.FullName -notlike "*\\bin\\*" -and
        $_.FullName -notlike "*\\obj\\*" -and
        $_.FullName -notlike "*\\.vs\\*" -and
        $_.FullName -notlike "*\\HelloWorld\\*" -and
        $_.Name -ne "countries.geojson"
    }

    return ($files | Measure-Object -Property LastWriteTime -Maximum).Maximum
}

function Stop-RunningGame {
    Get-Process HelloWorld -ErrorAction SilentlyContinue | Stop-Process -Force
}

$needsBuild = -not (Test-Path $outputPath)
if (-not $needsBuild) {
    $latestSource = Get-LatestSourceWriteTime
    $outputTime = (Get-Item $outputPath).LastWriteTime
    $needsBuild = $outputTime -lt $latestSource
}

if ($needsBuild) {
    Stop-RunningGame
    dotnet build $projectPath
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

Stop-RunningGame
dotnet run --no-build --project $projectPath
exit $LASTEXITCODE
