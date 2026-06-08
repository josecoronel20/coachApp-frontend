import type { BeforeInstallPromptEvent } from "@/components/PWAInstaller";

export const PWA_INSTALL_STATE_KEY = "impruv-coach-pwa-install-state";
export const PWA_INSTALL_READY_EVENT = "impruv-pwa-install-ready";
export const PWA_INSTALL_STATE_EVENT = "impruv-pwa-install-state-change";

const LEGACY_DISMISSED_KEY = "impruv-coach-pwa-install-dismissed";
const DAY_MS = 24 * 60 * 60 * 1000;
const DISMISS_COOLDOWNS_MS = [7 * DAY_MS, 30 * DAY_MS, 90 * DAY_MS];
const NATIVE_DISMISS_COOLDOWN_MS = 30 * DAY_MS;
const MIN_TIME_BETWEEN_SHOWS_MS = DAY_MS;

export type PWAInstallState = {
  dismissedAt?: number;
  dismissCount?: number;
  installedAt?: number;
  lastNativeDismissedAt?: number;
  lastShownAt?: number;
};

export function readPWAInstallState(): PWAInstallState {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage.getItem(PWA_INSTALL_STATE_KEY);

  if (!raw && window.localStorage.getItem(LEGACY_DISMISSED_KEY) === "true") {
    const migrated = { dismissedAt: Date.now(), dismissCount: 1 };
    window.localStorage.removeItem(LEGACY_DISMISSED_KEY);
    writePWAInstallState(migrated);
    return migrated;
  }

  if (!raw) return {};

  if (raw === "true") {
    const migrated = { dismissedAt: Date.now(), dismissCount: 1 };
    writePWAInstallState(migrated);
    return migrated;
  }

  try {
    return JSON.parse(raw) as PWAInstallState;
  } catch {
    return {};
  }
}

export function writePWAInstallState(state: PWAInstallState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PWA_INSTALL_STATE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(PWA_INSTALL_STATE_EVENT));
}

export function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isIosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return isDisplayStandalone || isIosStandalone;
}

export function isIosDevice() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

export function getAvailablePWAInstallPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === "undefined") return null;
  return window.__impruvInstallPrompt ?? null;
}

export function shouldShowCoachPWAInstallBanner(now = Date.now()) {
  if (typeof window === "undefined") return false;
  if (isStandaloneMode()) return false;

  const state = readPWAInstallState();
  if (state.installedAt) return false;

  const canOfferInstall = Boolean(getAvailablePWAInstallPrompt()) || isIosDevice();
  if (!canOfferInstall) return false;

  if (state.lastShownAt && now - state.lastShownAt < MIN_TIME_BETWEEN_SHOWS_MS) return false;

  if (state.lastNativeDismissedAt && now - state.lastNativeDismissedAt < NATIVE_DISMISS_COOLDOWN_MS) {
    return false;
  }

  const dismissCount = state.dismissCount ?? 0;
  const cooldown = DISMISS_COOLDOWNS_MS[Math.min(dismissCount, DISMISS_COOLDOWNS_MS.length - 1)];
  if (state.dismissedAt && now - state.dismissedAt < cooldown) return false;

  return true;
}

export function markPWAInstallBannerShown() {
  writePWAInstallState({
    ...readPWAInstallState(),
    lastShownAt: Date.now(),
  });
}

export function dismissPWAInstallBanner() {
  const state = readPWAInstallState();
  writePWAInstallState({
    ...state,
    dismissedAt: Date.now(),
    dismissCount: (state.dismissCount ?? 0) + 1,
  });
}

export function markPWAInstallAccepted() {
  writePWAInstallState({
    ...readPWAInstallState(),
    installedAt: Date.now(),
  });
}

export function markPWAInstallNativeDismissed() {
  writePWAInstallState({
    ...readPWAInstallState(),
    lastNativeDismissedAt: Date.now(),
  });
}

export async function runPWAInstallPrompt() {
  const prompt = getAvailablePWAInstallPrompt();
  if (!prompt) return "unavailable" as const;

  await prompt.prompt();
  const choice = await prompt.userChoice;

  if (choice.outcome === "accepted") {
    window.__impruvInstallPrompt = undefined;
    markPWAInstallAccepted();
    return "accepted" as const;
  }

  window.__impruvInstallPrompt = undefined;
  markPWAInstallNativeDismissed();
  return "dismissed" as const;
}
