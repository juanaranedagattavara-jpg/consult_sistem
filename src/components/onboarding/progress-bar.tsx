"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Cuenta" },
  { number: 2, label: "Clinica" },
  { number: 3, label: "Marca" },
  { number: 4, label: "Horario" },
  { number: 5, label: "Setup" },
];

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <div className="relative flex items-center justify-center w-full">
              {/* Line before */}
              {index > 0 && (
                <div
                  className={cn(
                    "absolute left-0 right-1/2 h-0.5 top-4 -translate-y-1/2",
                    currentStep > step.number ? "bg-primary" : "bg-gray-200"
                  )}
                />
              )}
              {/* Line after */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute left-1/2 right-0 h-0.5 top-4 -translate-y-1/2",
                    currentStep > step.number ? "bg-primary" : "bg-gray-200"
                  )}
                />
              )}
              {/* Circle */}
              <div
                className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep > step.number
                    ? "bg-primary text-white"
                    : currentStep === step.number
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
            </div>
            <span
              className={cn(
                "mt-2 text-xs",
                currentStep >= step.number ? "text-primary" : "text-gray-400"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
