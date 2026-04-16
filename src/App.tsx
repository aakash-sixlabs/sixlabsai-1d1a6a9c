import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/context/WizardContext";
import Landing from "./pages/Landing";
import SixLabsLanding from "./pages/SixLabsLanding";
import Onboarding from "./pages/Onboarding";
import OnboardingV2 from "./pages/OnboardingV2";
import DataReview from "./pages/DataReview";
import Insights from "./pages/Insights";
import CreateAd from "./pages/CreateAd";
import PdpScrape from "./pages/PdpScrape";
import Output from "./pages/Output";
import MetaCallback from "./pages/MetaCallback";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WizardProvider>
          <Routes>
            <Route path="/" element={<SixLabsLanding />} />
            <Route path="/login" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding-v2" element={<OnboardingV2 />} />
            <Route path="/data-review" element={<DataReview />} />
            <Route path="/home" element={<Insights />} />
            <Route path="/create-ad" element={<CreateAd />} />
            <Route path="/pdp-scrape" element={<PdpScrape />} />
            <Route path="/output" element={<Output />} />
            <Route path="/auth/callback" element={<MetaCallback />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WizardProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
