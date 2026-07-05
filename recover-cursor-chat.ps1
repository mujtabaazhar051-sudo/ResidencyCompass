# Cursor Chat History Recovery Script
# Restores state.vscdb files from Windows.old backup (pre-reinstall)
# IMPORTANT: Close ALL Cursor windows before running this script.

$ErrorActionPreference = "Stop"

$oldBase = "C:\Windows.old\Users\Mujtaba Azhar\AppData\Roaming\Cursor\User"
$newBase = "$env:APPDATA\Cursor\User"
$backupBase = "$env:USERPROFILE\Desktop\CursorRecoveryBackup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# --- Preflight checks ---
if (-not (Test-Path $oldBase)) {
    Write-Error "Windows.old backup not found at: $oldBase"
}

$cursorProcs = Get-Process -Name "Cursor*" -ErrorAction SilentlyContinue
if ($cursorProcs) {
    Write-Error "Cursor is still running ($($cursorProcs.Count) processes). Please close Cursor completely and re-run."
}

Write-Host "=== Cursor Chat Recovery ===" -ForegroundColor Cyan
Write-Host "Source: $oldBase"
Write-Host "Target: $newBase"
Write-Host "Backup: $backupBase"
Write-Host ""

# --- Backup current (post-reinstall) state ---
Write-Host "Step 1: Backing up current Cursor state..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupBase -Force | Out-Null

foreach ($subdir in @("globalStorage", "workspaceStorage")) {
    $src = Join-Path $newBase $subdir
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination (Join-Path $backupBase $subdir) -Recurse -Force
        Write-Host "  Backed up $subdir"
    }
}

# --- Restore globalStorage (347 MB - contains chat index & composer data) ---
Write-Host "Step 2: Restoring globalStorage..." -ForegroundColor Yellow
$oldGlobal = Join-Path $oldBase "globalStorage"
$newGlobal = Join-Path $newBase "globalStorage"
New-Item -ItemType Directory -Path $newGlobal -Force | Out-Null

foreach ($file in @("state.vscdb", "state.vscdb-wal", "state.vscdb-shm")) {
    $src = Join-Path $oldGlobal $file
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination (Join-Path $newGlobal $file) -Force
        $size = (Get-Item $src).Length
        Write-Host "  Restored globalStorage\$file ($([math]::Round($size/1MB, 1)) MB)"
    }
}

# Preserve current storage.json (window layout) if it exists
$currentStorageJson = Join-Path $backupBase "globalStorage\storage.json"
if (Test-Path $currentStorageJson) {
    Copy-Item -Path $currentStorageJson -Destination (Join-Path $newGlobal "storage.json") -Force
    Write-Host "  Kept current storage.json (window layout)"
}

# --- Restore workspace-specific chat databases ---
Write-Host "Step 3: Restoring workspaceStorage..." -ForegroundColor Yellow
$oldWs = Join-Path $oldBase "workspaceStorage"
$newWs = Join-Path $newBase "workspaceStorage"
New-Item -ItemType Directory -Path $newWs -Force | Out-Null

# Map: old folder hash -> workspace path
$workspaceMap = @{
    "c47e50a7c6b57e174072329b13229a4b" = "IMResidencyTool"
    "f12057e8a7c84ca5a8f2477b9841e2de" = "Desktop"
    "1782994478522" = "empty-window-recent"
    "empty-window" = "empty-window"
}

foreach ($folder in $workspaceMap.Keys) {
    $oldFolder = Join-Path $oldWs $folder
    if (-not (Test-Path $oldFolder)) { continue }

    $newFolder = Join-Path $newWs $folder
    if (Test-Path $newFolder) {
        # Merge: copy old DB files into existing folder (preserves new workspace.json if present)
        foreach ($file in Get-ChildItem $oldFolder -Filter "state.vscdb*") {
            Copy-Item -Path $file.FullName -Destination (Join-Path $newFolder $file.Name) -Force
        }
        $wsJson = Join-Path $oldFolder "workspace.json"
        if ((Test-Path $wsJson) -and -not (Test-Path (Join-Path $newFolder "workspace.json"))) {
            Copy-Item -Path $wsJson -Destination (Join-Path $newFolder "workspace.json") -Force
        }
    } else {
        Copy-Item -Path $oldFolder -Destination $newFolder -Recurse -Force
    }
    Write-Host "  Restored workspace: $($workspaceMap[$folder]) ($folder)"
}

# Also copy old DB files into the NEW hash folder Cursor created for IMResidencyTool
$newImHash = "361b0869cbb163bc7fb414a8e61ec4e9"
$oldImHash = "c47e50a7c6b57e174072329b13229a4b"
$newImFolder = Join-Path $newWs $newImHash
$oldImFolder = Join-Path $oldWs $oldImHash
if ((Test-Path $oldImFolder) -and (Test-Path $newImFolder)) {
    foreach ($file in Get-ChildItem $oldImFolder -Filter "state.vscdb*") {
        Copy-Item -Path $file.FullName -Destination (Join-Path $newImFolder $file.Name) -Force
    }
    Write-Host "  Also merged old IMResidencyTool DB into new hash folder ($newImHash)"
}

Write-Host ""
Write-Host "=== Recovery complete! ===" -ForegroundColor Green
Write-Host "Backup of pre-recovery state saved to:"
Write-Host "  $backupBase"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Open Cursor"
Write-Host "  2. Open your IMResidencyTool project folder"
Write-Host "  3. Check the chat/composer sidebar for your old conversations"
Write-Host ""
Write-Host "If chats don't appear, try: Help > Toggle Developer Tools > run in console:"
Write-Host '  localStorage.clear(); location.reload();'
Write-Host "(only as a last resort - this clears local cache)"
