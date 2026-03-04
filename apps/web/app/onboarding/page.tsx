"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Mythos! 🎉",
    description: "Your AI-powered marketing automation platform. Let's get you set up.",
    action: "Get Started",
  },
  {
    id: "goals",
    title: "What do you want to achieve?",
    description: "Select your primary goals so we can customize your experience.",
    options: ["Grow my audience", "Save time on content", "Create better content", "Automate workflows"],
    action: "Continue",
  },
  {
    id: "connect",
    title: "Connect your first platform",
    description: "Link a social media account to start publishing content.",
    action: "Connect Now",
    skip: "I'll do this later",
  },
  {
    id: "create",
    title: "Create your first post",
    description: "Let's create a post together with AI assistance.",
    action: "Create Post",
    skip: "Skip for now",
  },
  {
    id: "complete",
    title: "You're all set! 🚀",
    description: "You've completed the onboarding. Explore Mythos and start creating!",
    action: "Go to Dashboard",
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const router = useRouter();

  const step = ONBOARDING_STEPS[currentStep];

  function handleNext() {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      // Complete onboarding
      saveOnboardingProgress(true);
      router.push("/");
    } else {
      setCurrentStep(currentStep + 1);
      saveOnboardingProgress(false);
    }
  }

  function handleSkip() {
    setCurrentStep(currentStep + 1);
    saveOnboardingProgress(false);
  }

  function saveOnboardingProgress(complete: boolean) {
    // In production, this would call an API
    console.log("Saving progress:", { currentStep, complete });
  }

  function toggleGoal(goal: string) {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i <= currentStep ? "bg-blue-600" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">{step.title}</h1>
          <p className="text-neutral-600">{step.description}</p>
        </div>

        {/* Goals selection */}
        {step.options && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {step.options.map((option) => (
              <button
                key={option}
                onClick={() => toggleGoal(option)}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  selectedGoals.includes(option)
                    ? "border-blue-600 bg-blue-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleNext}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {step.action}
          </button>
          {step.skip && (
            <button
              onClick={handleSkip}
              className="text-neutral-500 hover:text-neutral-700 transition"
            >
              {step.skip}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
