import { ONBOARDING_ACTION_EVENT, waitForElement } from "@/onboarding/helpers";
import type { OnboardingStep } from "@/onboarding/flows";

type StepCompleteSource = "click" | "event" | "intro";

type StartOnboardingStepOptions = {
  onComplete?: (source: StepCompleteSource) => void;
  onExit?: () => void;
};

type IntroJsInstance = {
  setOptions: (options: {
    steps: Array<{
      element: Element;
      title: string;
      intro: string;
    }>;
    showStepNumbers: boolean;
    showBullets: boolean;
    showProgress: boolean;
    nextLabel: string;
    doneLabel: string;
    hidePrev: boolean;
    exitOnEsc: boolean;
    exitOnOverlayClick: boolean;
    disableInteraction: boolean;
    overlayOpacity: number;
    scrollToElement: boolean;
  }) => void;
  oncomplete: (callback: () => void) => void;
  onexit: (callback: () => void) => void;
  start: () => void;
  exit: (force?: boolean) => void;
};

let activeIntro: IntroJsInstance | null = null;
let cleanupActiveStep: (() => void) | null = null;
let activeStepKey: string | null = null;

function clearActiveStepState() {
  activeStepKey = null;
  activeIntro = null;
  cleanupActiveStep = null;
}

export function stopOnboardingStep() {
  if (activeIntro && typeof activeIntro.exit === "function") {
    try {
      activeIntro.exit(true);
    } catch {
      cleanupActiveStep?.();
      clearActiveStepState();
    }
  } else {
    cleanupActiveStep?.();
    clearActiveStepState();
  }
}

export async function startOnboardingStep(
  step: OnboardingStep,
  options: StartOnboardingStepOptions = {},
) {
  if (typeof window === "undefined") {
    return false;
  }

  const stepKey = `${step.route}:${step.id}`;

  if (activeStepKey === stepKey) {
    return true;
  }

  stopOnboardingStep();

  const element = await waitForElement(step.selector, {
    timeoutMs: step.waitTimeoutMs ?? 9000,
  });

  if (!element) {
    return false;
  }

  const introModule = await import("intro.js").catch(() => null);
  const introFactory = introModule?.default ?? introModule?.introJs ?? null;

  if (typeof introFactory !== "function") {
    return false;
  }

  let finished = false;

  const finish = (source?: StepCompleteSource) => {
    if (finished) {
      return;
    }

    finished = true;
    const introInstance = activeIntro;

    cleanupActiveStep?.();
    clearActiveStepState();

    if (introInstance && typeof introInstance.exit === "function") {
      try {
        introInstance.exit(true);
      } catch {}
    }

    if (source) {
      options.onComplete?.(source);
      return;
    }

    options.onExit?.();
  };

  const handleAction = (event: Event) => {
    const customEvent = event as CustomEvent<{ stepId?: string }>;

    if (customEvent.detail?.stepId === step.completionEvent) {
      finish("event");
    }
  };

  const handleTargetClick = () => {
    finish("click");
  };

  window.addEventListener(ONBOARDING_ACTION_EVENT, handleAction as EventListener);
  element.addEventListener("click", handleTargetClick, { once: true });

  cleanupActiveStep = () => {
    window.removeEventListener(ONBOARDING_ACTION_EVENT, handleAction as EventListener);
    element.removeEventListener("click", handleTargetClick);
  };

  activeStepKey = stepKey;
  activeIntro = introFactory() as IntroJsInstance;

  try {
    activeIntro.setOptions({
      steps: [
        {
          element,
          title: step.title,
          intro: step.intro,
        },
      ],
      showStepNumbers: false,
      showBullets: false,
      showProgress: false,
      nextLabel: "Done",
      doneLabel: "Done",
      hidePrev: true,
      exitOnEsc: true,
      exitOnOverlayClick: false,
      disableInteraction: false,
      overlayOpacity: 0.45,
      scrollToElement: true,
    });

    activeIntro.oncomplete(() => finish("intro"));
    activeIntro.onexit(() => finish());
    activeIntro.start();
  } catch {
    cleanupActiveStep?.();
    clearActiveStepState();
    return false;
  }

  return true;
}
