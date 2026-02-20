import React, { useState, useEffect, useRef } from "react";
import { STYLES } from "../../utils/styles";
import Navbar from "../Layout/Navbar";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import TestimonialsSection from "./TestimonialsSection";
import HowItWorks from "./HowItWorks";
import EventGallery from "./EventGallery";
import FeaturedEvents from "./FeaturedEvents";
import TrustSection from "./TrustSection";
import PricingSection from "./PricingSection";
import FinalCTASection from "./FinalCTASection";
import Footer from "./Footer";
import GradientButton from "../shared/GradientButton";

export default function Landing({ onGetStarted }) {
  const [visibleSections, setVisibleSections] = useState({ hero: true });
  const [scrolled, setScrolled] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.dataset.section]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (section) => (el) => {
    if (el) {
      sectionRefs.current[section] = el;
      el.dataset.section = section;
    }
  };

  return (
    <div
      style={{
        ...STYLES.page,
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(180deg, #0c0c0e 0%, #0A0A0B 50%, #080809 100%)",
      }}
    >
      {/* Subtle accent glow - modern, minimal */}
      <div
        style={{
          position: "fixed",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 900,
          height: "60vh",
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,89,49,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "glow-pulse 6s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      
      <Navbar
        onLogoClick={() => {}}
        showBack={false}
        scrolled={scrolled}
        rightContent={
          <GradientButton onClick={onGetStarted} size="sm" withArrow>
            Get Started
          </GradientButton>
        }
      />
      
      <div
        ref={setRef("hero")}
        style={{
          position: "relative",
          zIndex: 1,
          opacity: visibleSections.hero !== undefined ? 1 : 0,
          transform: visibleSections.hero ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        }}
      >
        <HeroSection onGetStarted={onGetStarted} />
      </div>
      <div
        ref={setRef("stats")}
        style={{
          position: "relative",
          zIndex: 1,
          opacity: visibleSections.stats !== undefined ? 1 : 0,
          transform: visibleSections.stats ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        }}
      >
        <StatsSection visible={visibleSections.stats} />
      </div>
      <div
        ref={setRef("testimonials")}
        style={{
          position: "relative",
          zIndex: 1,
          opacity: visibleSections.testimonials !== undefined ? 1 : 0,
          transform: visibleSections.testimonials ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        }}
      >
        <TestimonialsSection visible={visibleSections.testimonials} />
      </div>
      <div
        ref={setRef("gallery")}
        style={{
          opacity: visibleSections.gallery !== undefined ? 1 : 0,
          transform: visibleSections.gallery ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        }}
      >
        <EventGallery visible={visibleSections.gallery} />
      </div>
      
      <div
        ref={setRef("featured")}
        style={{
          opacity: visibleSections.featured !== undefined ? 1 : 0,
          transform: visibleSections.featured ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        }}
      >
        <FeaturedEvents visible={visibleSections.featured} />
      </div>
      
      <div
        ref={setRef("howitworks")}
        style={{
          opacity: visibleSections.howitworks !== undefined ? 1 : 0,
          transform: visibleSections.howitworks ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        }}
      >
        <HowItWorks visible={visibleSections.howitworks} />
      </div>
      <TrustSection />
      <div
        ref={setRef("pricing")}
        style={{
          opacity: visibleSections.pricing !== undefined ? 1 : 0,
          transform: visibleSections.pricing ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        }}
      >
        <PricingSection visible={visibleSections.pricing} onGetStarted={onGetStarted} onBookDemo={onGetStarted} />
      </div>
      <div style={{ padding: "0 32px 0" }}>
        <FinalCTASection onGetStarted={onGetStarted} />
      </div>
      <Footer />
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
