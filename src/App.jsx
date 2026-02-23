import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import PostPilot from "./PostPilot.jsx";
import Landing from "./components/Landing/Landing";
import MarketingLayout from "./components/Layout/MarketingLayout";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import DemoPage from "./pages/DemoPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CareersPage from "./pages/CareersPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

function LandingRoute() {
  const navigate = useNavigate();
  return (
    <Landing
      onGetStarted={() => navigate("/onboard")}
      onLogoClick={() => navigate("/")}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/features" element={<MarketingLayout><FeaturesPage /></MarketingLayout>} />
        <Route path="/pricing" element={<MarketingLayout><PricingPage /></MarketingLayout>} />
        <Route path="/demo" element={<MarketingLayout><DemoPage /></MarketingLayout>} />
        <Route path="/about" element={<MarketingLayout><AboutPage /></MarketingLayout>} />
        <Route path="/contact" element={<MarketingLayout><ContactPage /></MarketingLayout>} />
        <Route path="/careers" element={<MarketingLayout><CareersPage /></MarketingLayout>} />
        <Route path="/privacy" element={<MarketingLayout><PrivacyPage /></MarketingLayout>} />
        <Route path="/privacy-policy" element={<MarketingLayout><PrivacyPage /></MarketingLayout>} />
        <Route path="/terms" element={<MarketingLayout><TermsPage /></MarketingLayout>} />
        <Route path="/onboard" element={<PostPilot initialScreen="onboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
