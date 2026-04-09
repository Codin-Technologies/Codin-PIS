import type { ReadonlyURLSearchParams } from "next/navigation";

export const ONBOARDING_PROGRESS_EVENT = "onboarding:progress-change";
export const ONBOARDING_ACTION_EVENT = "onboarding:action";
export const ONBOARDING_RESTART_EVENT = "onboarding:restart";
export const ONBOARDING_CONTINUE_EVENT = "onboarding:continue";

export function emitOnboardingProgressChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(ONBOARDING_PROGRESS_EVENT));
}

export function emitOnboardingAction(stepId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ONBOARDING_ACTION_EVENT, {
      detail: {
        stepId,
      },
    }),
  );
}

export function requestOnboardingRestart() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(ONBOARDING_RESTART_EVENT));
}

export function requestOnboardingContinue() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(ONBOARDING_CONTINUE_EVENT));
}

export function parseRoute(route: string) {
  const [pathname, queryString = ""] = route.split("?");
  const params = new URLSearchParams(queryString);

  return {
    pathname,
    params,
  };
}

export function routeMatches(
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  route: string,
) {
  const parsed = parseRoute(route);

  if (pathname !== parsed.pathname) {
    return false;
  }

  for (const [key, value] of Array.from(parsed.params.entries())) {
    if (searchParams.get(key) !== value) {
      return false;
    }
  }

  return true;
}

export async function waitForElement(
  selector: string,
  options: { timeoutMs?: number; intervalMs?: number } = {},
) {
  if (typeof window === "undefined") {
    return null;
  }

  const timeoutMs = options.timeoutMs ?? 8000;
  const intervalMs = options.intervalMs ?? 250;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const element = document.querySelector(selector);

    if (element instanceof HTMLElement) {
      return element;
    }

    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }

  return null;
}
