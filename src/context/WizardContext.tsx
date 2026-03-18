import React, { createContext, useContext, useState, ReactNode } from "react";

export type WizardStep =
  | "landing"
  | "meta-connect"
  | "account-select"
  | "data-sync"
  | "insights"
  | "pdp-input"
  | "pdp-scrape"
  | "strategy"
  | "output"
  | "regenerate";

interface WizardState {
  step: WizardStep;
  metaConnected: boolean;
  selectedAccount: string | null;
  dateRange: string;
  syncComplete: boolean;
  pdpUrl: string;
  scrapeComplete: boolean;
  objective: string;
  formatPreference: string;
  notes: string;
}

interface WizardContextType {
  state: WizardState;
  setStep: (step: WizardStep) => void;
  updateState: (partial: Partial<WizardState>) => void;
  reset: () => void;
}

const initial: WizardState = {
  step: "landing",
  metaConnected: false,
  selectedAccount: null,
  dateRange: "90",
  syncComplete: false,
  pdpUrl: "",
  scrapeComplete: false,
  objective: "conversions",
  formatPreference: "single",
  notes: "",
};

const WizardContext = createContext<WizardContextType | null>(null);

export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
};

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WizardState>(initial);

  const setStep = (step: WizardStep) => setState((s) => ({ ...s, step }));
  const updateState = (partial: Partial<WizardState>) =>
    setState((s) => ({ ...s, ...partial }));
  const reset = () => setState(initial);

  return (
    <WizardContext.Provider value={{ state, setStep, updateState, reset }}>
      {children}
    </WizardContext.Provider>
  );
};
