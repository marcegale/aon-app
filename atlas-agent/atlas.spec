# -*- mode: python ; coding: utf-8 -*-
# Atlas PyInstaller spec — Phase 1
# Run: pyinstaller atlas.spec

block_cipher = None

a = Analysis(
    ["atlas.py"],
    pathex=["."],
    binaries=[],
    datas=[
        ("ui/cockpit/frontend", "ui/cockpit/frontend"),
    ],
    hiddenimports=[
        "config.settings",
        "broker",
        "state_machine",
        "logging_setup",
        "planner.planner",
        "planner.tool_registry",
        "permissions.guard",
        "ui.ui_bridge",
        "ui.orb.orb_window",
        "ui.orb.orb_state",
        "ui.cockpit.cockpit_window",
        "webview",
        "webview.platforms.winforms",
        "clr",
        "pythonnet",
        "PySide6.QtCore",
        "PySide6.QtGui",
        "PySide6.QtWidgets",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="atlas",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    # icon="assets/atlas.ico",
)
