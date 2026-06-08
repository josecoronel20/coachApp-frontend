import { useEffect } from "react";

/**
 * Desactiva zoom, doble click y menú contextual del navegador mientras la sesión está activa.
 */
export const useDisableBrowserGestures = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const preventDefault = (event: Event) => {
      event.preventDefault();
    };

    const listenerOptions: AddEventListenerOptions = { capture: true };

    const previousBodyTouchAction = document.body.style.touchAction;

    document.body.style.touchAction = "manipulation";

    document.addEventListener("dblclick", preventDefault, listenerOptions);
    document.addEventListener("contextmenu", preventDefault, listenerOptions);
    document.addEventListener("gesturestart", preventDefault, listenerOptions);
    document.addEventListener("gesturechange", preventDefault, listenerOptions);
    document.addEventListener("gestureend", preventDefault, listenerOptions);

    return () => {
      document.body.style.touchAction = previousBodyTouchAction;

      document.removeEventListener("dblclick", preventDefault, listenerOptions);
      document.removeEventListener("contextmenu", preventDefault, listenerOptions);
      document.removeEventListener("gesturestart", preventDefault, listenerOptions);
      document.removeEventListener("gesturechange", preventDefault, listenerOptions);
      document.removeEventListener("gestureend", preventDefault, listenerOptions);
    };
  }, [enabled]);
};
