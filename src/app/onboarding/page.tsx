"use client";

import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { Step1Account } from "@/components/onboarding/step-1-account";
import { Step2Clinic } from "@/components/onboarding/step-2-clinic";
import { Step3Branding } from "@/components/onboarding/step-3-branding";
import { Step4Schedule } from "@/components/onboarding/step-4-schedule";
import { Step5Setup } from "@/components/onboarding/step-5-setup";

export default function OnboardingPage() {
  const { currentStep, setStep } = useOnboardingStore();

  const handleNext = () => setStep(currentStep + 1);
  const handleBack = () => setStep(currentStep - 1);

  return (
    <div>
      <ProgressBar currentStep={currentStep} />

      {currentStep === 1 && <Step1Account onNext={handleNext} />}
      {currentStep === 2 && (
        <Step2Clinic onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === 3 && (
        <Step3Branding onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === 4 && (
        <Step4Schedule onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === 5 && <Step5Setup onBack={handleBack} />}
    </div>
  );
}
