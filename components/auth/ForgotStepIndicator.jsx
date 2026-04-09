import React from 'react';
import { Progress } from "@/components/ui/progress";

export default function ForgotStepIndicator({ currentStep }) {
  const steps = [
    { title: 'Email', description: 'Enter your email' },
    { title: 'OTP', description: 'Verify identity' },
    { title: 'Reset', description: 'New password' }
  ];

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="w-full space-y-4 mb-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Step {currentStep} of {steps.length}
          </p>
          <h2 className="text-lg font-bold text-foreground">
            {steps[currentStep - 1].title}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground italic">
          {steps[currentStep - 1].description}
        </p>
      </div>
      
      <div className="relative pt-1">
        <Progress value={progress} className="h-1.5" />
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-primary scale-125 ring-4 ring-primary/20' : 
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
