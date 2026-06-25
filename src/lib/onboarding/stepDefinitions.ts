import { ONBOARDING_MANAGER_PATHS } from "./routes";
import type { OnboardingStepDefinition, OnboardingStepId } from "./types";

export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  {
    id: "upload-logo",
    title: "Upload Logo",
    description: "Add your brand logo so customers can recognize your store.",
    buttonLabel: "Upload Logo",
    managerPath: ONBOARDING_MANAGER_PATHS.storeDetails,
  },
  {
    id: "add-product",
    title: "Add Your First Product",
    description: "Add your first product with price, image, and details.",
    buttonLabel: "Add Product",
    estimatedTime: "2 minutes",
    managerPath: ONBOARDING_MANAGER_PATHS.addProduct,
  },
  {
    id: "add-category",
    title: "Add Category",
    description: "Organize your products into categories.",
    buttonLabel: "Add Category",
    managerPath: ONBOARDING_MANAGER_PATHS.addCategory,
  },
  {
    id: "customize-website",
    title: "Customize Your Website",
    description:
      "Update banners, homepage sections, about us, contact details, and store content.",
    buttonLabel: "Customize Website",
    managerPath: ONBOARDING_MANAGER_PATHS.contentManagement,
  },
  {
    id: "share-website",
    title: "Share Your Website",
    description: "Copy your store link and share it with your WhatsApp and Instagram customers.",
    buttonLabel: "Copy Link",
    managerPath: "",
  },
];

export const ONBOARDING_STEP_ORDER: OnboardingStepId[] = ONBOARDING_STEPS.map((s) => s.id);
