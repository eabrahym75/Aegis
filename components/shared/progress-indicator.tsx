"use client";

import { cn } from "@/lib/utils/cn";

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  labels,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">
          Step {currentStep} of {totalSteps}
        </span>
        {labels && labels[currentStep - 1] && (
          <span className="text-sm text-slate-600">
            {labels[currentStep - 1]}
          </span>
        )}
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

