import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
    isOpen: boolean
    currentStep: number
    hasSeenOnboarding: boolean
    startTour: () => void
    closeTour: () => void
    nextStep: () => void
    prevStep: () => void
    setStep: (step: number) => void
    resetTour: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            isOpen: false,
            currentStep: 0,
            hasSeenOnboarding: false,
            startTour: () => set({ isOpen: true, currentStep: 0 }),
            closeTour: () => set({ isOpen: false, hasSeenOnboarding: true }),
            nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
            prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
            setStep: (step) => set({ currentStep: step }),
            resetTour: () => set({ isOpen: true, currentStep: 0, hasSeenOnboarding: false }),
        }),
        {
            name: 'onboarding-storage',
            partialize: (state) => ({ hasSeenOnboarding: state.hasSeenOnboarding }),
        }
    )
)
