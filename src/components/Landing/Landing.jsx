import React, { useState, useEffect, useRef } from "react";
import { STYLES } from "../../utils/styles";
import Navbar from "../Layout/Navbar";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import HowItWorks from "./HowItWorks";
import EventGallery from "./EventGallery";
import FeaturedEvents from "./FeaturedEvents";
import GradientButton from "../shared/GradientButton";

export default function Landing({ onGetStarted }) {
  const [visibleSections, setVisibleSections] = useState({ hero: true });
  const sectionRefs = useRef({});

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
    <div style={{ ...STYLES.page, overflow: "hidden", position: "relative" }}>
      {/* Enhanced background decorative elements */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,89,49,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          animation: "float 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,185,49,0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          animation: "float 25s ease-in-out infinite reverse",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "10%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          animation: "float 30s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 20,
          right: -60,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,89,49,0.1) 0%, transparent 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          animation: "float 22s ease-in-out infinite",
        }}
      />
      
      <Navbar
        onLogoClick={() => {}}
        showBack={false}
        rightContent={
          <GradientButton onClick={onGetStarted} size="sm">
            Get Started →
          </GradientButton>
        }
        style={{ position: "relative", zIndex: 10 }}
      />
      
      {/* Hero + stats in one wrapper with unified gradient background */}
      <div
        style={{
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: -120,
            background: `linear-gradient(to bottom,
              rgba(232,89,49,0.06) 0%,
              rgba(232,89,49,0.04) 18%,
              rgba(232,185,49,0.025) 40%,
              rgba(232,89,49,0.012) 60%,
              #0f0f10 85%,
              #0A0A0B 100%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          ref={setRef("hero")}
          style={{
            position: "relative",
            zIndex: 1,
            opacity: visibleSections.hero !== undefined ? 1 : 0,
            transform: visibleSections.hero ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
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
            transform: visibleSections.stats ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          }}
        >
          <StatsSection />
        </div>
      </div>
      
      <div
        ref={setRef("gallery")}
        style={{
          opacity: visibleSections.gallery !== undefined ? 1 : 0,
          transform: visibleSections.gallery ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        <EventGallery />
      </div>
      
      <div
        ref={setRef("featured")}
        style={{
          opacity: visibleSections.featured !== undefined ? 1 : 0,
          transform: visibleSections.featured ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        <FeaturedEvents />
      </div>
      
      <div
        ref={setRef("howitworks")}
        style={{
          opacity: visibleSections.howitworks !== undefined ? 1 : 0,
          transform: visibleSections.howitworks ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        <HowItWorks />
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
