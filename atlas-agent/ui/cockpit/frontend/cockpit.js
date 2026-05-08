'use strict';

const MAX_LOG_ENTRIES = 50;

const stateBadge = document.getElementById('state-badge');
const orbDot     = document.querySelector('.orb-dot');
const logEl      = document.getElementById('log');

// ── State colours for the header dot ──────────────────────────────────────
const DOT_COLORS = {
  IDLE:               ['#1a9fff', 'rgba(26,159,255,0.7)'],
  LISTENING:          ['#00e676', 'rgba(0,230,118,0.7)'],
  CAPTURING_CONTEXT:  ['#7c4dff', 'rgba(124,77,255,0.7)'],
  PLANNING:           ['#7c4dff', 'rgba(124,77,255,0.7)'],
  WAITING_PERMISSION: ['#ffeb3b', 'rgba(255,235,59,0.7)'],
  EXECUTING:          ['#ff9800', 'rgba(255,152,0,0.7)'],
  VERIFYING:          ['#7c4dff', 'rgba(124,77,255,0.7)'],
  REPORTING:          ['#7c4dff', 'rgba(124,77,255,0.7)'],
  ERROR:              ['#f44336', 'rgba(244,67,54,0.7)'],
};

// ── Public API (called from Python via evaluate_js) ────────────────────────
window.setCockpitState = function (fsmState) {
  // remove all state classes
  stateBadge.className = '';
  stateBadge.classList.add(fsmState);
  stateBadge.textContent = fsmState;

  const [color, glow] = DOT_COLORS[fsmState] || DOT_COLORS['IDLE'];
  orbDot.style.background = color;
  orbDot.style.boxShadow  = `0 0 6px ${glow}`;
};

window.appendEvent = function (event) {
  // event: { name, body, time }
  const entry = document.createElement('div');
  entry.className = 'log-entry';

  const t = document.createElement('span');
  t.className = 'log-time';
  t.textContent = event.time || _now();

  const ev = document.createElement('span');
  ev.className = 'log-event';
  ev.textContent = event.name || 'event';

  const b = document.createElement('span');
  b.className = 'log-body';
  b.textContent = event.body || '';

  entry.append(t, ev, b);
  logEl.appendChild(entry);

  // cap entries
  while (logEl.children.length > MAX_LOG_ENTRIES) {
    logEl.removeChild(logEl.firstChild);
  }

  logEl.scrollTop = logEl.scrollHeight;
};

// ── Close button ──────────────────────────────────────────────────────────
document.getElementById('close-btn').addEventListener('click', () => {
  pywebview.api.close_cockpit().catch(() => {});
});

// ── Helpers ────────────────────────────────────────────────────────────────
function _now() {
  return new Date().toTimeString().slice(0, 8);
}

// ── Init ───────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  window.setCockpitState('IDLE');
  window.appendEvent({ name: 'atlas', body: 'Phase 1 cockpit ready', time: _now() });
});
