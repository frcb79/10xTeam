"use client";

import { createContext, useCallback, useContext, useReducer } from "react";
import type {
  GeneratedOutputs,
  ICPQualityScore,
  ICPType,
  Step2Answers,
  Step3B2BAnswers,
  Step3B2CAnswers,
  Step4Answers,
  Step5Answers,
  WizardAction,
  WizardState,
  WizardStep,
} from "@/types/wizard.types";

const initialState: WizardState = {
  currentStep: 1,
  status: "idle",
  completedSteps: [],
  icpType: null,
  websiteUrl: null,
  scrapedContent: null,
  prefillConfidence: null,
  answers: {
    step2: null,
    step3_b2b: null,
    step3_b2c: null,
    step4: null,
    step5: null,
  },
  icpScore: null,
  generatedOutputs: null,
  error: null,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_STATUS":
      return { ...state, status: action.payload, error: null };
    case "SET_WEBSITE_URL":
      return { ...state, websiteUrl: action.payload, status: "scraping" };
    case "SET_SCRAPED_CONTENT":
      return {
        ...state,
        scrapedContent: action.payload.content,
        prefillConfidence: action.payload.confidence,
        status: "scraping_complete",
      };
    case "SET_ICP_TYPE":
      return { ...state, icpType: action.payload };
    case "UPDATE_STEP2":
      return {
        ...state,
        answers: { ...state.answers, step2: action.payload },
        icpType: action.payload.icpType,
      };
    case "UPDATE_STEP3_B2B":
      return { ...state, answers: { ...state.answers, step3_b2b: action.payload } };
    case "UPDATE_STEP3_B2C":
      return { ...state, answers: { ...state.answers, step3_b2c: action.payload } };
    case "UPDATE_STEP4":
      return { ...state, answers: { ...state.answers, step4: action.payload } };
    case "UPDATE_STEP5":
      return { ...state, answers: { ...state.answers, step5: action.payload } };
    case "SET_ICP_SCORE":
      return { ...state, icpScore: action.payload };
    case "SET_GENERATED_OUTPUTS":
      return { ...state, generatedOutputs: action.payload, status: "complete" };
    case "COMPLETE_STEP":
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.payload)
          ? state.completedSteps
          : [...state.completedSteps, action.payload],
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, status: "error" };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface WizardContextValue {
  state: WizardState;
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goPrev: () => void;
  setWebsiteUrl: (url: string) => void;
  setScrapedContent: (content: string, confidence: WizardState["prefillConfidence"]) => void;
  setICPType: (type: ICPType) => void;
  updateStep2: (data: Step2Answers) => void;
  updateStep3B2B: (data: Step3B2BAnswers) => void;
  updateStep3B2C: (data: Step3B2CAnswers) => void;
  updateStep4: (data: Step4Answers) => void;
  updateStep5: (data: Step5Answers) => void;
  setStatus: (status: WizardState["status"]) => void;
  setError: (error: string) => void;
  completeStep: (step: WizardStep) => void;
  setGeneratedOutputs: (outputs: GeneratedOutputs) => void;
  setICPScore: (score: ICPQualityScore) => void;
  reset: () => void;
  canGoNext: boolean;
  isStepCompleted: (step: WizardStep) => boolean;
  getStep3Component: () => "b2b" | "b2c" | "mixed";
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const goToStep = useCallback((step: WizardStep) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const goNext = useCallback(() => {
    if (state.currentStep < 5) {
      dispatch({ type: "COMPLETE_STEP", payload: state.currentStep });
      dispatch({ type: "SET_STEP", payload: (state.currentStep + 1) as WizardStep });
    }
  }, [state.currentStep]);

  const goPrev = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: "SET_STEP", payload: (state.currentStep - 1) as WizardStep });
    }
  }, [state.currentStep]);

  const value: WizardContextValue = {
    state,
    goToStep,
    goNext,
    goPrev,
    setWebsiteUrl: (url) => dispatch({ type: "SET_WEBSITE_URL", payload: url }),
    setScrapedContent: (content, confidence) => {
      if (!confidence) return;
      dispatch({ type: "SET_SCRAPED_CONTENT", payload: { content, confidence } });
    },
    setICPType: (type) => dispatch({ type: "SET_ICP_TYPE", payload: type }),
    updateStep2: (data) => dispatch({ type: "UPDATE_STEP2", payload: data }),
    updateStep3B2B: (data) => dispatch({ type: "UPDATE_STEP3_B2B", payload: data }),
    updateStep3B2C: (data) => dispatch({ type: "UPDATE_STEP3_B2C", payload: data }),
    updateStep4: (data) => dispatch({ type: "UPDATE_STEP4", payload: data }),
    updateStep5: (data) => dispatch({ type: "UPDATE_STEP5", payload: data }),
    setStatus: (status) => dispatch({ type: "SET_STATUS", payload: status }),
    setError: (error) => dispatch({ type: "SET_ERROR", payload: error }),
    completeStep: (step) => dispatch({ type: "COMPLETE_STEP", payload: step }),
    setGeneratedOutputs: (outputs) =>
      dispatch({ type: "SET_GENERATED_OUTPUTS", payload: outputs }),
    setICPScore: (score) => dispatch({ type: "SET_ICP_SCORE", payload: score }),
    reset: () => dispatch({ type: "RESET" }),
    canGoNext: state.status !== "processing" && state.status !== "error",
    isStepCompleted: (step) => state.completedSteps.includes(step),
    getStep3Component: () => {
      if (state.icpType === "b2c" || state.icpType === "freelancer") return "b2c";
      if (state.icpType === "mixed") return "mixed";
      return "b2b";
    },
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
