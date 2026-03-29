import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/context/WizardContext";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import DataReview from "./pages/DataReview";
import Insights from "./pages/Insights";
import PdpInput from "./pages/PdpInput";
import PdpScrape from "./pages/PdpScrape";
import Strategy from "./pages/Strategy";
import Output from "./pages/Output";
import MetaCallback from "./pages/MetaCallback";
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
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/data-review" element={<DataReview />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/pdp-input" element={<PdpInput />} />
            <Route path="/pdp-scrape" element={<PdpScrape />} />
            <Route path="/strategy" element={<Strategy />} />
            <Route path="/output" element={<Output />} />
            <Route path="/meta-callback" element={<MetaCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WizardProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
