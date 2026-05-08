import logging


class OrbWindow:
    """Primary Atlas interface — a floating orb that reflects agent state.

    The orb is always visible while Atlas is running. It is minimal and
    non-intrusive. The cockpit (CockpitWindow) is the optional expanded view.

    Phase 0: all methods are stubs. Real implementation (pywebview + WebView2
    floating window with animations) is deferred to Phase 1.
    """

    def start(self) -> None:
        logging.info("[orb] OrbWindow.start() — pendiente Fase 1")

    def set_state(self, orb_state: str) -> None:
        logging.info("[orb] set_state(%s) — pendiente Fase 1", orb_state)

    def stop(self) -> None:
        logging.info("[orb] OrbWindow.stop() — pendiente Fase 1")
