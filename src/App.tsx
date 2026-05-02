import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/context/WizardContext";
import { GenerationNotificationsProvider } from "@/context/GenerationNotificationsContext";
import Landing from "./pages/Landing";
import LandingV1 from "./pages/LandingV1";
import SixLabsLanding from "./pages/SixLabsLanding";
import Onboarding from "./pages/Onboarding";
import OnboardingV2 from "./pages/OnboardingV2";
import DataReview from "./pages/DataReview";
import Insights from "./pages/Insights";
import CreateAd from "./pages/CreateAd";
import PdpScrape from "./pages/PdpScrape";
import Output from "./pages/Output";
import Settings from "./pages/Settings";
import MetaCallback from "./pages/MetaCallback";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DebugSyncPage from "./pages/DebugSyncPage";
import GenerationDetail from "./pages/GenerationDetail";
import OnboardingV1Live from "./pages/OnboardingV1Live";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WizardProvider>
          <GenerationNotificationsProvider>
          <Routes>
            <Route path="/" element={<SixLabsLanding />} />
            <Route path="/loginvcollect" element={<Landing />} />
            <Route path="/loginv1" element={<LandingV1 />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding-v2" element={<OnboardingV2 />} />
            <Route path="/data-review" element={<DataReview />} />
            <Route path="/home" element={<Insights />} />
            <Route path="/create-ad" element={<CreateAd />} />
            <Route path="/pdp-scrape" element={<PdpScrape />} />
            <Route path="/output" element={<Output />} />
            <Route path="/generations/:jobId" element={<GenerationDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth/callback" element={<MetaCallback />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/debug-sync" element={<DebugSyncPage />} />
            <Route path="/onboardingv1" element={<OnboardingV1Live />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </GenerationNotificationsProvider>
        </WizardProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
