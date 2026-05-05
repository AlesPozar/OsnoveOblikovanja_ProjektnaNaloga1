"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import TitleScreen from "@/components/TitleScreen";
import AboutSection from "@/components/AboutSection";
import ColorSection from "@/components/ColorSection";
import LikedSection from "@/components/LikedSection";
import { dominantSkins, averageSkins, weightedSkins } from "@/lib/skinData";

const TOTAL_SECTIONS = 5;
const SECTION_ABOUT = 0;
const SECTION_DOMINANT = 1;
const SECTION_AVERAGE = 2;
const SECTION_WEIGHTED = 3;
const SECTION_LIKED = 4;

export default function Home() {
  const [showMain, setShowMain] = useState(false);
  const [currentSection, setCurrentSection] = useState(SECTION_ABOUT);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [analysisMode, setAnalysisMode] = useState<"whole" | "ingame">("whole");

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToSection = useCallback((index: number) => {
    const el = sectionRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentSection(index);
    }
  }, []);

  const handleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Intersection observer — update active section dot
  useEffect(() => {
    if (!showMain) return;
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            setCurrentSection(i);
          }
        },
        { threshold: 0.45 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [showMain]);

  if (!showMain) {
    return <TitleScreen onContinue={() => setShowMain(true)} />;
  }

  const navProps = {
    currentSection,
    totalSections: TOTAL_SECTIONS,
    onNavClick: scrollToSection,
  };

  return (
    <div className="bg-white">
      {/* Section 0: About */}
      <div ref={(el) => { sectionRefs.current[SECTION_ABOUT] = el; }}>
        <AboutSection {...navProps} />
      </div>

      {/* Section 1: Dominant Color */}
      <div ref={(el) => { sectionRefs.current[SECTION_DOMINANT] = el; }}>
        <ColorSection
          title="BY DOMINANT COLOR"
          titleClass="title-dom"
          subtitle="Weapons analysed by single dominant color"
          skins={dominantSkins}
          likedIds={likedIds}
          onLike={handleLike}
          onGoToLiked={() => scrollToSection(SECTION_LIKED)}
          analysisMode={analysisMode}
          onAnalysisModeChange={setAnalysisMode}
          sectionIndex={SECTION_DOMINANT}
          {...navProps}
        />
      </div>

      {/* Section 2: Average Color */}
      <div ref={(el) => { sectionRefs.current[SECTION_AVERAGE] = el; }}>
        <ColorSection
          title="BY AVERAGE COLOR"
          titleClass="title-avg"
          subtitle="Weapons analysed by average pixel color"
          skins={averageSkins}
          likedIds={likedIds}
          onLike={handleLike}
          onGoToLiked={() => scrollToSection(SECTION_LIKED)}
          analysisMode={analysisMode}
          onAnalysisModeChange={setAnalysisMode}
          sectionIndex={SECTION_AVERAGE}
          {...navProps}
        />
      </div>

      {/* Section 3: Weighted Average */}
      <div ref={(el) => { sectionRefs.current[SECTION_WEIGHTED] = el; }}>
        <ColorSection
          title="BY WEIGHTED AVERAGE"
          titleClass="title-wavg"
          subtitle="Weapons analysed by frequency-weighted average color"
          skins={weightedSkins}
          likedIds={likedIds}
          onLike={handleLike}
          onGoToLiked={() => scrollToSection(SECTION_LIKED)}
          analysisMode={analysisMode}
          onAnalysisModeChange={setAnalysisMode}
          sectionIndex={SECTION_WEIGHTED}
          {...navProps}
        />
      </div>

      {/* Section 4: Liked */}
      <div ref={(el) => { sectionRefs.current[SECTION_LIKED] = el; }}>
        <LikedSection
          likedIds={likedIds}
          allSkins={[dominantSkins, averageSkins, weightedSkins]}
          onUnlike={handleLike}
          {...navProps}
        />
      </div>
    </div>
  );
}
