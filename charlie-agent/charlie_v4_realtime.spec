# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['charlie_v4_realtime.py'],
    pathex=['C:\\Users\\dagog\\Desktop\\aon-app\\charlie-agent'],
    binaries=[],
    datas=[],
    hiddenimports=['orchestrator', 'planner', 'resolvers', 'command_catalog', 'executors.apps', 'executors.notes', 'executors.whatsapp'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='charlie_v4_realtime',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
