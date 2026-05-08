'use strict';

const ORB_STATES = [
  'ORB_IDLE', 'ORB_LISTENING', 'ORB_THINKING',
  'ORB_EXECUTING', 'ORB_WAITING_PERMISSION', 'ORB_ERROR',
];

const orb = document.getElementById('orb');

// ── State ─────────────────────────────────────────────────────────────────
window.setOrbState = function (state) {
  ORB_STATES.forEach(s => orb.classList.remove(s));
  orb.classList.add(state);
};

// ── Drag ──────────────────────────────────────────────────────────────────
let dragging = false;
let dragStartX = 0, dragStartY = 0;
let mouseDownX = 0, mouseDownY = 0;
const DRAG_THRESHOLD = 5;

orb.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  dragging    = false;
  dragStartX  = e.screenX;
  dragStartY  = e.screenY;
  mouseDownX  = e.screenX;
  mouseDownY  = e.screenY;

  const onMove = mv => {
    const dx = mv.screenX - mouseDownX;
    const dy = mv.screenY - mouseDownY;
    if (!dragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      dragging = true;
    }
    if (dragging) {
      pywebview.api.move_window(mv.screenX - dragStartX, mv.screenY - dragStartY)
        .then(([nx, ny]) => { dragStartX = mx => nx; })
        .catch(() => {});
      dragStartX = mv.screenX;
      dragStartY = mv.screenY;
    }
  };

  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    if (!dragging) {
      pywebview.api.toggle_cockpit().catch(() => {});
    }
    dragging = false;
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  e.preventDefault();
});

// ── Init ──────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  orb.classList.remove('loading');
  orb.classList.add('ready');
  window.setOrbState('ORB_IDLE');
});
