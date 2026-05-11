'use strict';

const stateBadge = document.getElementById('state-badge');
const orbDot     = document.querySelector('.orb-dot');
const messagesEl = document.getElementById('messages');
const inputEl    = document.getElementById('prompt-input');
const sendBtn    = document.getElementById('send-btn');

let isBusy      = false;
let thinkingEl  = null;

// ── State colours ──────────────────────────────────────────────────────────
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
  stateBadge.className = '';
  stateBadge.classList.add(fsmState);
  stateBadge.textContent = fsmState;
  const [color, glow] = DOT_COLORS[fsmState] || DOT_COLORS['IDLE'];
  orbDot.style.background = color;
  orbDot.style.boxShadow  = `0 0 6px ${glow}`;
};

window.appendEvent = function (_event) {
  // FSM state transitions are reflected in the state badge; no visible log.
};

window.showUserMessage = function (text) {
  _removeThinking();
  const el = document.createElement('div');
  el.className = 'msg user';
  el.textContent = text;
  messagesEl.appendChild(el);
  _scroll();
};

window.showAtlasResponse = function (text, mode, isError) {
  _removeThinking();
  const el = document.createElement('div');
  el.className = isError ? 'msg atlas error' : 'msg atlas';
  el.textContent = text;
  if (mode === 'mock') {
    const badge = document.createElement('span');
    badge.className = 'mode-badge';
    badge.textContent = 'mock';
    el.appendChild(badge);
  }
  messagesEl.appendChild(el);
  _scroll();
};

window.setThinking = function (active) {
  if (active) {
    if (thinkingEl) return;
    thinkingEl = document.createElement('div');
    thinkingEl.className = 'msg atlas thinking';
    thinkingEl.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(thinkingEl);
    _scroll();
    _setBusy(true);
  } else {
    _removeThinking();
    _setBusy(false);
  }
};

// ── Input handling ─────────────────────────────────────────────────────────
function _send() {
  const prompt = inputEl.value.trim();
  if (!prompt || isBusy) return;
  inputEl.value = '';
  _autoResize();
  pywebview.api.send_message(prompt).catch(function (err) {
    console.error('send_message error', err);
    _setBusy(false);
  });
}

sendBtn.addEventListener('click', _send);

inputEl.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    _send();
  }
});

inputEl.addEventListener('input', _autoResize);

document.getElementById('close-btn').addEventListener('click', function () {
  pywebview.api.close_cockpit().catch(function () {});
});

// ── Helpers ────────────────────────────────────────────────────────────────
function _setBusy(busy) {
  isBusy = busy;
  sendBtn.disabled = busy;
  inputEl.disabled = busy;
}

function _removeThinking() {
  if (thinkingEl) {
    thinkingEl.remove();
    thinkingEl = null;
  }
}

function _scroll() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function _autoResize() {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
}

// ── Init ───────────────────────────────────────────────────────────────────
window.addEventListener('load', function () {
  window.setCockpitState('IDLE');
  _autoResize();
});
