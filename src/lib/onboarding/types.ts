export type OnboardingStepId =
  | "upload-logo"
  | "add-product"
  | "add-category"
  | "customize-website"
  | "connect-razorpay"
  | "share-website";

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  title: string;
  description: string;
  buttonLabel: string;
  estimatedTime?: string;
  managerPath: string;
}

export interface OnboardingProgressState {
  steps: Record<OnboardingStepId, boolean>;
  completedCount: number;
  totalCount: number;
  allComplete: boolean;
  nextIncompleteStepId: OnboardingStepId | null;
  storeUrl: string;
  hasSavedContentStyles: boolean;
  loading: boolean;
  error: string | null;
}

export type OnboardingShareAction = "copy" | "open" | "whatsapp";
