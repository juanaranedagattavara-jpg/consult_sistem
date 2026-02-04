import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccountData {
  name: string;
  email: string;
}

interface ClinicData {
  name: string;
  taxId: string;
  address: string;
  phone: string;
}

interface BrandingData {
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
}

interface ScheduleData {
  workDays: number[];
  openTime: string;
  closeTime: string;
  lunchStart?: string;
  lunchEnd?: string;
}

interface SetupData {
  professionalName: string;
  serviceName: string;
  serviceDuration: number;
}

interface OnboardingData {
  account: AccountData | null;
  clinic: ClinicData | null;
  branding: BrandingData | null;
  schedule: ScheduleData | null;
  setup: SetupData | null;
}

interface OnboardingStore {
  currentStep: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  setStepData: <K extends keyof OnboardingData>(step: K, data: OnboardingData[K]) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  account: null,
  clinic: null,
  branding: null,
  schedule: null,
  setup: null,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: initialData,
      setStep: (step) => set({ currentStep: step }),
      setStepData: (step, data) =>
        set((state) => ({
          data: { ...state.data, [step]: data },
        })),
      reset: () => set({ currentStep: 1, data: initialData }),
    }),
    { name: "onboarding-storage" }
  )
);
