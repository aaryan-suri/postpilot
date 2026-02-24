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
import LoginPage from "./pages/Login.jsx";
import { AuthProvider, RequireAuth } from "./context/AuthContext.jsx";

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
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route
            path="/features"
            element={
              <MarketingLayout>
                <FeaturesPage />
              </MarketingLayout>
            }
          />
          <Route
            path="/pricing"
            element={
              <MarketingLayout>
                <PricingPage />
              </MarketingLayout>
            }
          />
          <Route
            path="/demo"
            element={
              <MarketingLayout>
                <DemoPage />
              </MarketingLayout>
            }
          />
          <Route
            path="/about"
            element={
              <MarketingLayout>
                <AboutPage />
              </MarketingLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <MarketingLayout>
                <ContactPage />
              </MarketingLayout>
            }
          />
          <Route
            path="/careers"
            element={
              <MarketingLayout>
                <CareersPage />
              </MarketingLayout>
            }
          />
          <Route
            path="/privacy"
            element={
              <MarketingLayout>
                <PrivacyPage />
              </MarketingLayout>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <MarketingLayout>
                <PrivacyPage />
              </MarketingLayout>
            }
          />
          <Route
            path="/terms"
            element={
              <MarketingLayout>
                <TermsPage />
              </MarketingLayout>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboard" element={<PostPilot initialScreen="onboard" />} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <PostPilot initialScreen="dashboard" />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
