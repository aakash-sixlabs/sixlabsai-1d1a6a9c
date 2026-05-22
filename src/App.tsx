import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/context/WizardContext";
import { GenerationNotificationsProvider } from "@/context/GenerationNotificationsContext";

const Landing = lazy(() => import("./pages/Landing"));
const LandingV1 = lazy(() => import("./pages/LandingV1"));
const SixLabsLanding = lazy(() => import("./pages/SixLabsLanding"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const OnboardingV2 = lazy(() => import("./pages/OnboardingV2"));
const DataReview = lazy(() => import("./pages/DataReview"));
const Insights = lazy(() => import("./pages/Insights"));
const CreateAd = lazy(() => import("./pages/CreateAd"));
const PdpScrape = lazy(() => import("./pages/PdpScrape"));
const Output = lazy(() => import("./pages/Output"));
const Settings = lazy(() => import("./pages/Settings"));
const MetaCallback = lazy(() => import("./pages/MetaCallback"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DebugSyncPage = lazy(() => import("./pages/DebugSyncPage"));
const GenerationDetail = lazy(() => import("./pages/GenerationDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WizardProvider>
          <GenerationNotificationsProvider>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
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
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </GenerationNotificationsProvider>
        </WizardProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
