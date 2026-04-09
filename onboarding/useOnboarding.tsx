"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { startOnboardingStep, stopOnboardingStep } from "@/onboarding/engine";
import {
  getCurrentOnboardingStep,
  getInitialOnboardingProgress,
  type OnboardingProgress,
} from "@/onboarding/flows";
import {
  ONBOARDING_CONTINUE_EVENT,
  ONBOARDING_PROGRESS_EVENT,
  ONBOARDING_RESTART_EVENT,
  routeMatches,
} from "@/onboarding/helpers";
import {
  completeStep,
  getProgress,
  moveToNextStep,
  resetOnboarding,
  resumeOnboarding,
  skipOnboarding,
} from "@/onboarding/storage";

function getProgressSnapshot(userId?: string | null) {
  if (typeof window === "undefined") {
    return getInitialOnboardingProgress();
  }

  return getProgress(userId);
}

export function useOnboarding(userId?: string | null) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const [progress, setProgress] = useState<OnboardingProgress>(() => getProgressSnapshot(userId));
  const activeStepKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const syncProgress = () => {
      setProgress(getProgressSnapshot(userId));
    };

    const handleContinue = () => {
      const latest = resumeOnboarding(userId);
      const nextStep = getCurrentOnboardingStep(latest)?.step;

      if (!nextStep || latest.isComplete) {
        setProgress(latest);
        return;
      }

      stopOnboardingStep();
      activeStepKeyRef.current = null;
      setProgress(latest);
      router.push(nextStep.route);
    };

    const handleRestart = () => {
      stopOnboardingStep();
      activeStepKeyRef.current = null;
      setProgress(resetOnboarding(userId));
    };

    window.addEventListener(ONBOARDING_CONTINUE_EVENT, handleContinue);
    window.addEventListener(ONBOARDING_PROGRESS_EVENT, syncProgress);
    window.addEventListener(ONBOARDING_RESTART_EVENT, handleRestart);
    window.addEventListener("storage", syncProgress);

    return () => {
      window.removeEventListener(ONBOARDING_CONTINUE_EVENT, handleContinue);
      window.removeEventListener(ONBOARDING_PROGRESS_EVENT, syncProgress);
      window.removeEventListener(ONBOARDING_RESTART_EVENT, handleRestart);
      window.removeEventListener("storage", syncProgress);
    };
  }, [router, userId]);

  useEffect(() => {
    setProgress(getProgressSnapshot(userId));
  }, [userId]);

  const currentStepState = useMemo(() => getCurrentOnboardingStep(progress), [progress]);
  const currentStep = currentStepState?.step ?? null;
  const currentModule = currentStepState?.module ?? null;
  const isRouteReady =
    !!currentStep && routeMatches(pathname, searchParams, currentStep.route);

  useEffect(() => {
    if (!currentStep || progress.isComplete || progress.isSkipped) {
      stopOnboardingStep();
      activeStepKeyRef.current = null;
      return;
    }

    if (!isRouteReady) {
      stopOnboardingStep();
      activeStepKeyRef.current = null;
      return;
    }

    const stepKey = `${currentStep.route}:${currentStep.id}`;

    if (activeStepKeyRef.current === stepKey) {
      return;
    }

    activeStepKeyRef.current = stepKey;
    let cancelled = false;

    void startOnboardingStep(currentStep, {
      onComplete: () => {
        if (cancelled) {
          return;
        }

        const latest = getProgress(userId);
        const latestStepState = getCurrentOnboardingStep(latest);

        if (!latestStepState || latestStepState.step.id !== currentStep.id) {
          activeStepKeyRef.current = null;
          return;
        }

        completeStep(currentStep.id, userId);
        moveToNextStep(userId);
        activeStepKeyRef.current = null;
        setProgress(getProgress(userId));
      },
      onExit: () => {
        if (cancelled) {
          return;
        }

        activeStepKeyRef.current = null;
      },
    }).then((started) => {
      if (!started && !cancelled && activeStepKeyRef.current === stepKey) {
        activeStepKeyRef.current = null;
      }
    });

    return () => {
      cancelled = true;
      stopOnboardingStep();
      if (activeStepKeyRef.current === stepKey) {
        activeStepKeyRef.current = null;
      }
    };
  }, [
    currentStep,
    isRouteReady,
    pathname,
    progress.isComplete,
    progress.isSkipped,
    searchParamsKey,
    userId,
  ]);

  return {
    progress,
    currentModule,
    currentStep,
    startOnboarding: () => {
      const latest = resumeOnboarding(userId);
      const nextStep = getCurrentOnboardingStep(latest)?.step ?? currentStep;

      if (!nextStep) {
        return;
      }

      setProgress(latest);
      router.push(nextStep.route);
    },
    skipOnboarding: () => {
      stopOnboardingStep();
      activeStepKeyRef.current = null;
      setProgress(skipOnboarding(userId));
    },
    continueOnboarding: () => {
      const latest = resumeOnboarding(userId);
      const nextStep = getCurrentOnboardingStep(latest)?.step ?? currentStep;

      if (!nextStep || latest.isComplete) {
        setProgress(latest);
        return;
      }

      stopOnboardingStep();
      activeStepKeyRef.current = null;
      setProgress(latest);
      router.push(nextStep.route);
    },
    restartOnboarding: () => {
      stopOnboardingStep();
      activeStepKeyRef.current = null;
      setProgress(resetOnboarding(userId));
    },
  };
}

export function OnboardingController() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const userName = session?.user?.name ?? "there";
  const initialProgress = useMemo(() => getInitialOnboardingProgress(), []);
  const {
    progress,
    startOnboarding,
    skipOnboarding: skipCurrentOnboarding,
  } = useOnboarding(userId);

  const isFreshProgress =
    progress.currentModule === initialProgress.currentModule &&
    progress.currentStepIndex === initialProgress.currentStepIndex &&
    progress.completedModules.length === 0 &&
    progress.completedSteps.length === 0 &&
    !progress.isComplete &&
    !progress.isSkipped &&
    !progress.hasSeenWelcome;

  if (status !== "authenticated" || !userId || !isFreshProgress) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl border border-gray-100">
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pink-500">Welcome</p>
          <h2 className="mt-3 text-3xl font-black text-gray-900">Hi, {userName}.</h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Ready to set up your workspace? We can guide you through Settings, Inventory,
            Kitchen, and Procurement one action at a time.
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Guided path</span>
            <span className="font-bold text-gray-900">Settings -&gt; Inventory -&gt; Kitchen -&gt; Procurement</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Experience</span>
            <span className="font-bold text-gray-900">One focused popup at a time</span>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={skipCurrentOnboarding}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={startOnboarding}
            className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition-opacity hover:opacity-90"
          >
            Start onboarding
          </button>
        </div>
      </div>
    </div>
  );
}
