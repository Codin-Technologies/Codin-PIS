import {
  getCurrentOnboardingStep,
  getInitialOnboardingProgress,
  getModuleById,
  getModuleIndex,
  onboardingModules,
  type OnboardingProgress,
} from "@/onboarding/flows";
import { emitOnboardingProgressChange } from "@/onboarding/helpers";

const STORAGE_KEY = "onboarding_progress";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getStorageKey(userId?: string | null) {
  return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
}

function sanitizeProgress(progress: Partial<OnboardingProgress> | null | undefined): OnboardingProgress {
  const fallback = getInitialOnboardingProgress();

  if (!progress) {
    return fallback;
  }

  const onboardingModule = getModuleById(progress.currentModule ?? fallback.currentModule);
  const currentModule = onboardingModule?.id ?? fallback.currentModule;
  const stepCount = onboardingModule?.steps.length ?? 1;
  const currentStepIndex = Math.min(
    Math.max(progress.currentStepIndex ?? fallback.currentStepIndex, 0),
    Math.max(stepCount - 1, 0),
  );

  return {
    currentModule,
    currentStepIndex,
    completedModules: Array.from(new Set(progress.completedModules ?? [])),
    completedSteps: Array.from(new Set(progress.completedSteps ?? [])),
    isComplete: Boolean(progress.isComplete),
    isSkipped: Boolean(progress.isSkipped),
    hasSeenWelcome: Boolean(progress.hasSeenWelcome),
  };
}

export function getProgress(userId?: string | null) {
  if (!canUseStorage()) {
    return getInitialOnboardingProgress();
  }

  try {
    const stored = window.localStorage.getItem(getStorageKey(userId));

    if (!stored) {
      return getInitialOnboardingProgress();
    }

    return sanitizeProgress(JSON.parse(stored));
  } catch {
    return getInitialOnboardingProgress();
  }
}

export function setProgress(progress: OnboardingProgress, userId?: string | null) {
  const nextProgress = sanitizeProgress(progress);

  if (canUseStorage()) {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(nextProgress));
  }

  emitOnboardingProgressChange();
  return nextProgress;
}

export function completeStep(stepId: string, userId?: string | null) {
  const current = getProgress(userId);

  if (current.completedSteps.includes(stepId)) {
    return current;
  }

  return setProgress(
    {
      ...current,
      completedSteps: [...current.completedSteps, stepId],
    },
    userId,
  );
}

export function markWelcomeSeen(userId?: string | null) {
  const current = getProgress(userId);

  if (current.hasSeenWelcome) {
    return current;
  }

  return setProgress(
    {
      ...current,
      hasSeenWelcome: true,
    },
    userId,
  );
}

export function moveToNextModule(userId?: string | null) {
  const current = getProgress(userId);
  const currentModuleIndex = getModuleIndex(current.currentModule);
  const currentModule = getModuleById(current.currentModule);

  if (currentModule && !current.completedModules.includes(current.currentModule)) {
    current.completedModules = [...current.completedModules, current.currentModule];
  }

  const nextModule = onboardingModules[currentModuleIndex + 1];

  if (!nextModule) {
    return setProgress(
      {
        ...current,
        isComplete: true,
      },
      userId,
    );
  }

  return setProgress(
    {
      ...current,
      currentModule: nextModule.id,
      currentStepIndex: 0,
    },
    userId,
  );
}

export function moveToNextStep(userId?: string | null) {
  const current = getProgress(userId);
  const currentStep = getCurrentOnboardingStep(current);

  if (!currentStep) {
    return current;
  }

  const nextStepIndex = current.currentStepIndex + 1;

  if (nextStepIndex < currentStep.module.steps.length) {
    return setProgress(
      {
        ...current,
        currentStepIndex: nextStepIndex,
      },
      userId,
    );
  }

  return moveToNextModule(userId);
}

export function resetOnboarding(userId?: string | null) {
  const initial = getInitialOnboardingProgress();

  if (canUseStorage()) {
    window.localStorage.removeItem(getStorageKey(userId));
  }

  emitOnboardingProgressChange();
  return initial;
}

export function skipOnboarding(userId?: string | null) {
  const current = getProgress(userId);

  return setProgress(
    {
      ...current,
      isSkipped: true,
      hasSeenWelcome: true,
    },
    userId,
  );
}

export function resumeOnboarding(userId?: string | null) {
  const current = getProgress(userId);

  if (!current.isSkipped && current.hasSeenWelcome) {
    return current;
  }

  return setProgress(
    {
      ...current,
      isSkipped: false,
      hasSeenWelcome: true,
    },
    userId,
  );
}
