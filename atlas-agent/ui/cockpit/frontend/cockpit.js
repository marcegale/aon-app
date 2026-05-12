'use strict';

const stateBadge     = document.getElementById('state-badge');
const orbDot         = document.querySelector('.orb-dot');
const messagesEl     = document.getElementById('messages');
const inputEl        = document.getElementById('prompt-input');
const sendBtn        = document.getElementById('send-btn');
const permCard       = document.getElementById('permission-card');
const permBadge      = document.getElementById('perm-badge');
const permTitle      = document.getElementById('perm-title');
const permDesc       = document.getElementById('perm-description');
const permWarning    = document.getElementById('perm-warning');
const permApproveBtn = document.getElementById('perm-approve-btn');
const permCancelBtn  = document.getElementById('perm-cancel-btn');
const permCloseBtn   = document.getElementById('perm-close-btn');
const regCard        = document.getElementById('registration-card');
const regCodeEl      = document.getElementById('reg-device-code');
const regExpiresEl   = document.getElementById('reg-expires');
const regUrlEl       = document.getElementById('reg-url-fallback');
const regCopyBtn     = document.getElementById('reg-copy-btn');
const regOpenBtn     = document.getElementById('reg-open-btn');

let isBusy          = false;
let thinkingEl      = null;
let pendingActionId = null;
let _regUrl         = null;

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
  _focusInput();
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

window.showPermissionCard = function (action, isDestructiveBlocked) {
  pendingActionId = action.id || null;

  const level = (action.permission_level || 'SENSITIVE').toUpperCase();
  permBadge.textContent = level;
  permBadge.className   = 'perm-badge ' + level.toLowerCase();

  permTitle.textContent     = action.display && action.display.title       ? action.display.title       : 'Acción requerida';
  permDesc.textContent      = action.display && action.display.description ? action.display.description : '';
  permWarning.textContent   = action.display && action.display.warning     ? action.display.warning     : '';
  permWarning.style.display = permWarning.textContent ? '' : 'none';

  if (isDestructiveBlocked) {
    permApproveBtn.classList.add('hidden');
    permCancelBtn.classList.add('hidden');
    permCloseBtn.classList.remove('hidden');
  } else {
    permApproveBtn.classList.remove('hidden');
    permCancelBtn.classList.remove('hidden');
    permCloseBtn.classList.add('hidden');
  }

  permCard.classList.remove('hidden');
  _setBusy(true);
};

window.hidePermissionCard = function () {
  permCard.classList.add('hidden');
  pendingActionId = null;
  _setBusy(false);
  _focusInput();
};

// ── Registration card ──────────────────────────────────────────────────────
window.showRegistrationCard = function (reg) {
  regCodeEl.textContent    = reg.device_code      || '';
  regUrlEl.textContent     = reg.registration_url || '';
  regExpiresEl.textContent = reg.expires_at
    ? 'Expira: ' + new Date(reg.expires_at).toLocaleString('es')
    : '';
  _regUrl = reg.registration_url || null;
  regCard.classList.remove('hidden');
  _setBusy(true);
};

window.hideRegistrationCard = function () {
  regCard.classList.add('hidden');
  _regUrl = null;
  _setBusy(false);
  _focusInput();
};

// ── Action Result Card ─────────────────────────────────────────────────────
window.showActionResult = function (result) {
  _removeThinking();
  const card = _buildResultCard(result);
  messagesEl.appendChild(card);
  _scroll();
  _focusInput();
};

// Legacy alias — transforms output+ok into a minimal ActionResult shape
window.showToolResult = function (output, ok) {
  window.showActionResult({
    ok: ok,
    tool: 'terminal',
    operation: 'run_command',
    permission_level: 'SENSITIVE',
    stdout: output || '',
    stderr: '',
    returncode: ok ? 0 : 1,
    duration_ms: null,
    truncated: false,
    stderr_truncated: false,
    error_code: ok ? null : 'EXEC_ERROR',
    error_message: ok ? null : output,
    started_at: null,
    finished_at: null,
  });
};

function _buildConnectorCard(result) {
  var connector = result.connector;
  var card = document.createElement('div');
  card.className = 'action-result connector-required';

  var header = document.createElement('div');
  header.className = 'ar-header';

  var status = document.createElement('span');
  status.className = 'ar-status';
  status.textContent = '⚠';
  header.appendChild(status);

  var label = document.createElement('span');
  label.className = 'ar-label';
  label.textContent = (result.tool || '') + (result.operation ? ' · ' + result.operation : '');
  header.appendChild(label);

  var ec = document.createElement('span');
  ec.className = 'ar-error-code connector';
  ec.textContent = 'CONNECTOR_REQUIRED';
  header.appendChild(ec);

  card.appendChild(header);

  var body = document.createElement('div');
  body.className = 'ar-body';

  var msg = document.createElement('p');
  msg.className = 'ar-connector-msg';
  msg.textContent = result.error_message || (connector.display_name + ' no está conectado.');
  body.appendChild(msg);

  var connectBtn = document.createElement('button');
  connectBtn.className = 'ar-connect-btn';
  connectBtn.textContent = 'Conectar ' + connector.display_name;
  connectBtn.addEventListener('click', function () {
    pywebview.api.open_external_url(connector.connect_url).catch(function (err) {
      console.error('open_external_url error', err);
    });
  });
  body.appendChild(connectBtn);

  card.appendChild(body);
  return card;
}

function _buildResultCard(result) {
  // CONNECTOR_REQUIRED: special amber card with a Conectar button
  if (result.error_code === 'CONNECTOR_REQUIRED' && result.connector) {
    return _buildConnectorCard(result);
  }

  var ok = result.ok === true;

  var card = document.createElement('div');
  card.className = 'action-result ' + (ok ? 'ok' : 'err');

  // ── Header ─────────────────────────────────────────────────────────────
  var header = document.createElement('div');
  header.className = 'ar-header';

  var status = document.createElement('span');
  status.className = 'ar-status';
  status.textContent = ok ? '✓' : '✗';
  header.appendChild(status);

  var label = document.createElement('span');
  label.className = 'ar-label';
  label.textContent = (result.tool || '') + (result.operation ? ' · ' + result.operation : '');
  header.appendChild(label);

  if (result.error_code) {
    var ec = document.createElement('span');
    ec.className = 'ar-error-code';
    ec.textContent = result.error_code;
    header.appendChild(ec);
  }

  if (result.duration_ms !== null && result.duration_ms !== undefined) {
    var dur = document.createElement('span');
    dur.className = 'ar-duration';
    dur.textContent = result.duration_ms + 'ms';
    header.appendChild(dur);
  }

  var hasOutput = result.stdout && result.stdout.trim();
  if (hasOutput) {
    var copyBtn = document.createElement('button');
    copyBtn.className = 'ar-copy';
    copyBtn.textContent = 'copiar';
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(result.stdout).then(function () {
        copyBtn.textContent = '✓';
        setTimeout(function () { copyBtn.textContent = 'copiar'; }, 1500);
      }).catch(function () {
        copyBtn.textContent = 'error';
      });
    });
    header.appendChild(copyBtn);
  }

  card.appendChild(header);

  // ── Body ───────────────────────────────────────────────────────────────
  var body = document.createElement('div');
  body.className = 'ar-body';

  if (result.error_code && !hasOutput) {
    var msg = document.createElement('p');
    msg.className = 'ar-error-msg';
    msg.textContent = result.error_message || 'Error desconocido.';
    body.appendChild(msg);
  } else {
    var stdout = result.stdout || '';
    var pre = document.createElement('pre');
    pre.className = 'ar-stdout';
    pre.textContent = stdout.trim() || '(sin salida)';
    body.appendChild(pre);

    if (result.truncated) {
      var trunc = document.createElement('p');
      trunc.className = 'ar-truncated';
      trunc.textContent = '▸ salida truncada';
      body.appendChild(trunc);
    }

    if (result.stderr && result.stderr.trim()) {
      var sLabel = document.createElement('p');
      sLabel.className = 'ar-stderr-label';
      sLabel.textContent = 'stderr';
      body.appendChild(sLabel);

      var spre = document.createElement('pre');
      spre.className = 'ar-stderr';
      spre.textContent = result.stderr.trim();
      body.appendChild(spre);

      if (result.stderr_truncated) {
        var strunc = document.createElement('p');
        strunc.className = 'ar-truncated';
        strunc.textContent = '▸ stderr truncado';
        body.appendChild(strunc);
      }
    }
  }

  if (result.returncode !== null && result.returncode !== undefined) {
    var footer = document.createElement('div');
    footer.className = 'ar-footer';
    var exitSpan = document.createElement('span');
    exitSpan.className = 'ar-exit ' + (result.returncode === 0 ? 'ok' : 'err');
    exitSpan.textContent = 'exit ' + result.returncode;
    footer.appendChild(exitSpan);
    body.appendChild(footer);
  }

  card.appendChild(body);
  return card;
}

// ── Permission card buttons ────────────────────────────────────────────────
permApproveBtn.addEventListener('click', function () {
  pywebview.api.approve_action(pendingActionId || '').catch(function (err) {
    console.error('approve_action error', err);
  });
});

permCancelBtn.addEventListener('click', function () {
  pywebview.api.cancel_action(pendingActionId || '').catch(function (err) {
    console.error('cancel_action error', err);
  });
});

permCloseBtn.addEventListener('click', function () {
  pywebview.api.cancel_action(pendingActionId || '').catch(function (err) {
    console.error('cancel_action (close) error', err);
  });
});

// ── Registration card buttons ──────────────────────────────────────────────
regCopyBtn.addEventListener('click', function () {
  var code = regCodeEl.textContent;
  if (!code) return;
  navigator.clipboard.writeText(code).then(function () {
    regCopyBtn.textContent = 'copiado';
    setTimeout(function () { regCopyBtn.textContent = 'copiar'; }, 1500);
  }).catch(function () {
    regCopyBtn.textContent = 'error';
    setTimeout(function () { regCopyBtn.textContent = 'copiar'; }, 1500);
  });
});

regOpenBtn.addEventListener('click', function () {
  if (!_regUrl) return;
  pywebview.api.open_external_url(_regUrl).catch(function (err) {
    console.error('open_external_url error', err);
  });
});

// ── Input handling ─────────────────────────────────────────────────────────
function _send() {
  var prompt = inputEl.value.trim();
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
window._focusInput = function () {
  if (!isBusy && inputEl && !inputEl.disabled) {
    inputEl.focus();
  }
};

function _focusInput() {
  window._focusInput();
}

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
  _focusInput();
});
