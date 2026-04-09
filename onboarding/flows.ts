export type OnboardingStep = {
  id: string;
  title: string;
  intro: string;
  route: string;
  selector: string;
  completionEvent?: string;
  waitTimeoutMs?: number;
};

export type OnboardingModule = {
  id: string;
  title: string;
  steps: OnboardingStep[];
};

export type OnboardingProgress = {
  currentModule: string;
  currentStepIndex: number;
  completedModules: string[];
  completedSteps: string[];
  isComplete: boolean;
  isSkipped: boolean;
  hasSeenWelcome: boolean;
};

export const onboardingFlow = {
  modules: [
    {
      id: "settings",
      title: "Settings",
      steps: [
        {
          id: "add-user",
          title: "Add your first user",
          intro: "Create the first system user account to begin onboarding your team.",
          route: "/settings?tab=users&action=create-user",
          selector: "[data-tour='create-user-submit-btn']",
          completionEvent: "add-user",
        },
        {
          id: "add-role",
          title: "Add your first role",
          intro: "Define an initial role so user access can be assigned consistently.",
          route: "/settings?tab=roles&action=create-role",
          selector: "[data-tour='create-role-submit-btn']",
          completionEvent: "add-role",
        },
        {
          id: "add-department",
          title: "Add organization department",
          intro: "Create the first department to organize requests, budgets, and stock ownership.",
          route: "/settings?tab=departments&action=create-department",
          selector: "[data-tour='create-department-submit-btn']",
          completionEvent: "add-department",
        },
        {
          id: "change-password",
          title: "Change your password",
          intro: "Finish settings onboarding by updating your password from the security tab.",
          route: "/settings?tab=security",
          selector: "[data-tour='change-password-submit-btn']",
          completionEvent: "change-password",
        },
      ],
    },
    {
      id: "inventory",
      title: "Inventory",
      steps: [
        {
          id: "add-inventory-item",
          title: "Add your first inventory items",
          intro: "Create the first stock item so inventory operations have something to track.",
          route: "/inventory?action=new-item",
          selector: "[data-tour='add-inventory-submit-btn']",
          completionEvent: "add-inventory-item",
        },
        {
          id: "create-usage-log",
          title: "Create Usage log and access usage records",
          intro: "Record a usage entry from the usage records screen to start tracking consumption.",
          route: "/inventory/usage?action=new-usage",
          selector: "[data-tour='record-usage-submit-btn']",
          completionEvent: "create-usage-log",
        },
        {
          id: "approve-production-usage",
          title: "Approve Inventory Usage from Production Plans",
          intro: "Approve a kitchen production request so inventory can be deducted against real usage.",
          route: "/inventory",
          selector: "[data-tour='approve-production-usage-btn']",
          completionEvent: "approve-production-usage",
          waitTimeoutMs: 12000,
        },
      ],
    },
    {
      id: "kitchen",
      title: "Kitchen",
      steps: [
        {
          id: "create-production-plan",
          title: "Creating Production Plans",
          intro: "Plan a production run to connect kitchen demand with inventory usage.",
          route: "/kitchen?tab=production&action=new-production",
          selector: "[data-tour='create-production-submit-btn']",
          completionEvent: "create-production-plan",
        },
        {
          id: "create-special-order",
          title: "Creating Special Orders",
          intro: "Log a special order so the kitchen can track requests outside the standard plan.",
          route: "/kitchen?tab=special&action=new-special-order",
          selector: "[data-tour='create-special-order-submit-btn']",
          completionEvent: "create-special-order",
        },
      ],
    },
    {
      id: "procurement",
      title: "Procurement",
      steps: [
        {
          id: "create-requisition",
          title: "Creating Requisition",
          intro: "Submit the first requisition to kick off the procurement workflow.",
          route: "/procurement?tab=overview&action=new-req",
          selector: "[data-tour='create-requisition-submit-btn']",
          completionEvent: "create-requisition",
        },
        {
          id: "approve-requisition",
          title: "Reviewing and approving requisition",
          intro: "Review a pending requisition and approve it to move sourcing forward.",
          route: "/procurement?tab=requisitions&action=review-pending",
          selector: "[data-tour='approve-requisition-btn']",
          completionEvent: "approve-requisition",
          waitTimeoutMs: 12000,
        },
        {
          id: "create-rfq",
          title: "Creating RFQ from approved requisition",
          intro: "Use an approved requisition to create a sourcing event for suppliers.",
          route: "/procurement?tab=requisitions&action=create-rfq-from-approved",
          selector: "[data-tour='create-rfq-submit-btn']",
          completionEvent: "create-rfq",
          waitTimeoutMs: 12000,
        },
        {
          id: "create-supplier",
          title: "Creating New Suppliers",
          intro: "Register a supplier so they can participate in sourcing and quotation workflows.",
          route: "/procurement?tab=suppliers&action=new-supplier",
          selector: "[data-tour='create-supplier-submit-btn']",
          completionEvent: "create-supplier",
        },
        {
          id: "manage-rfq",
          title: "Managing RFQ",
          intro: "Review quotations and award a contract from the RFQ manage center.",
          route: "/procurement?tab=rfq&action=manage-latest",
          selector: "[data-tour='award-rfq-contract-btn'], [data-tour='manage-rfq-btn']",
          completionEvent: "manage-rfq",
          waitTimeoutMs: 12000,
        },
      ],
    },
  ] as OnboardingModule[],
};

export const onboardingModules = onboardingFlow.modules;

export function getModuleIndex(moduleId: string) {
  return onboardingModules.findIndex((onboardingModule) => onboardingModule.id === moduleId);
}

export function getModuleById(moduleId: string) {
  return onboardingModules.find((onboardingModule) => onboardingModule.id === moduleId) ?? null;
}

export function getStepById(stepId: string) {
  for (const onboardingModule of onboardingModules) {
    const step = onboardingModule.steps.find((candidate) => candidate.id === stepId);
    if (step) {
      return { module: onboardingModule, step };
    }
  }

  return null;
}

export function getInitialOnboardingProgress(): OnboardingProgress {
  return {
    currentModule: onboardingModules[0]?.id ?? "settings",
    currentStepIndex: 0,
    completedModules: [],
    completedSteps: [],
    isComplete: false,
    isSkipped: false,
    hasSeenWelcome: false,
  };
}

export function getCurrentOnboardingStep(progress: OnboardingProgress) {
  const onboardingModule = getModuleById(progress.currentModule);

  if (!onboardingModule) {
    return null;
  }

  const step = onboardingModule.steps[progress.currentStepIndex] ?? null;

  if (!step) {
    return null;
  }

  return {
    module: onboardingModule,
    step,
  };
}
