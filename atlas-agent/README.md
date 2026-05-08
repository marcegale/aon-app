# Atlas — Technical README

## What Atlas is

Atlas is an AI-powered desktop assistant for Windows, distributed as part of the ai.gency platform. It is a separate product from Charlie and shares no runtime code with it.

**Atlas does not replace Charlie.** Charlie remains a dedicated voice assistant using the OpenAI Realtime API. Atlas is a general-purpose agentic desktop assistant built on a different architecture.

---

## Interface model

**The orb is the primary interface of Atlas.**
The orb is a small floating window that is always visible while Atlas runs. It reflects the agent's current state through visual cues. It is minimal and non-intrusive — designed to live on the edge of the screen without demanding attention.

**The cockpit is an optional expanded view.**
The cockpit is a larger panel that can be opened on demand from the orb or via hotkey. It shows conversation history, details of executed actions, and configuration options. Closing the cockpit does not affect the running agent — the orb continues operating independently.

---

## Architecture

```
atlas.py (entry)
  ├── logging_setup.py       safe logging, no recursion possible
  ├── config/settings.py     loads .env.local
  ├── broker.py              internal pub/sub event bus
  ├── state_machine.py       FSM — 9 states, valid transitions enforced
  ├── planner/
  │   ├── planner.py         calls /api/atlas/plan (backend broker, no direct AI keys)
  │   └── tool_registry.py   tool manifest with permission levels
  ├── permissions/guard.py   consent layer — PUBLIC / SENSITIVE / DESTRUCTIVE
  ├── tools/                 tool executors (Phase 4+)
  ├── audio/                 wake word + recorder + transcriber (Phase 5+)
  ├── vision/                screenshot capture + analyzer (Phase 3+)
  └── ui/
      ├── ui_bridge.py       routes broker events to orb and cockpit
      ├── orb/
      │   ├── orb_window.py  OrbWindow — primary floating interface
      │   └── orb_state.py   visual state constants + FSM→OrbState map
      └── cockpit/
          └── cockpit_window.py  CockpitWindow — optional expanded panel
```

### Key principle: no API keys on the desktop

The Atlas desktop runtime never holds API keys for Claude, OpenAI, or any other AI service. All AI calls are proxied through the ai.gency backend:

- `/api/atlas/plan` — receives prompt + context, returns structured plan from Claude
- `/api/atlas/vision` — receives screenshot, returns visual analysis from Claude Vision
- `/api/atlas/session` — issues ephemeral tokens for the session

---

## FSM States

| State | Description |
|---|---|
| IDLE | Waiting for input — orb is calm |
| LISTENING | Recording user input |
| CAPTURING_CONTEXT | Taking screenshot or gathering context |
| PLANNING | Backend is building an action plan |
| WAITING_PERMISSION | Showing permission dialog to user |
| EXECUTING | Running a tool action |
| VERIFYING | Confirming the action completed correctly |
| REPORTING | Delivering the result to the user |
| ERROR | Something went wrong — returns to IDLE |

### FSM → Orb visual state mapping

| FSM State | Orb Visual |
|---|---|
| IDLE | ORB_IDLE |
| LISTENING | ORB_LISTENING |
| CAPTURING_CONTEXT | ORB_THINKING |
| PLANNING | ORB_THINKING |
| WAITING_PERMISSION | ORB_WAITING_PERMISSION |
| EXECUTING | ORB_EXECUTING |
| VERIFYING | ORB_THINKING |
| REPORTING | ORB_THINKING |
| ERROR | ORB_ERROR |

---

## Environment variables

Copy `.env.local.template` to `.env.local` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `ATLAS_DEVICE_KEY` | Yes | Device key issued by ai.gency admin |
| `BACKEND_URL` | Yes | Base URL of the ai.gency platform |
| `ATLAS_USER_NAME` | No | Display name (default: "usuario") |

---

## Running locally (development)

```bash
# Create a dedicated virtual environment — do NOT share with charlie-agent
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Phase 0: .env.local is optional — agent runs in dev mode without it
python atlas.py
```

Expected output in `atlas.log`:
```
[atlas] Atlas Phase 0 — skeleton demo starting
[fsm] initialized — state=IDLE
[orb] OrbWindow.start() — pendiente Fase 1
[fsm] IDLE → LISTENING
[ui_bridge] FSM LISTENING → OrbState ORB_LISTENING
[orb] set_state(ORB_LISTENING) — pendiente Fase 1
[fsm] LISTENING → PLANNING
[ui_bridge] FSM PLANNING → OrbState ORB_THINKING
[orb] set_state(ORB_THINKING) — pendiente Fase 1
[fsm] PLANNING → REPORTING
[ui_bridge] FSM REPORTING → OrbState ORB_THINKING
[orb] set_state(ORB_THINKING) — pendiente Fase 1
[fsm] REPORTING → IDLE
[ui_bridge] FSM IDLE → OrbState ORB_IDLE
[orb] set_state(ORB_IDLE) — pendiente Fase 1
[atlas] demo complete — all transitions successful
[orb] OrbWindow.stop() — pendiente Fase 1
[cockpit] CockpitWindow.close() — pendiente Fase 1
[atlas] Atlas Phase 0 — shutdown clean
```

## Building the exe

```bash
pyinstaller atlas.spec
# Output: dist/atlas.exe
```

---

## Development phases

| Phase | Introduces |
|---|---|
| 0 | Skeleton — FSM, broker, logging, stub UI, stub planner |
| 1 | Desktop shell — OrbWindow (pywebview), floating orb widget |
| 2 | Text commands + general queries via /api/atlas/plan |
| 3 | Screen vision — on-demand screenshot + Claude Vision |
| 4 | Tool execution — apps, files, browser, system actions |
| 5 | Voice — push-to-talk hotkey + Whisper transcription |
| 6 | Packaging — installer, auto-update, crash reporting |

---

## What Atlas does NOT do

- Does not replace Charlie
- Does not share code with `charlie-agent/`
- Does not use the OpenAI Realtime API
- Does not stream microphone audio permanently
- Does not hold API keys in the exe
- Does not execute actions without user consent
- Does not capture screenshots passively
