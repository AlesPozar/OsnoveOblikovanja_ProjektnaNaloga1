"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Maximize2, Monitor } from "lucide-react";
import TitleScreen from "@/components/TitleScreen";
import ColorSection from "@/components/ColorSection";
import LikedSection from "@/components/LikedSection";
import AboutSecNew from "@/components/AboutSecNew";
import { dominantSkins, averageSkins, weightedSkins, dominantMasksSkins, averageMasksSkins, weightedMasksSkins } from "@/lib/skinData";

const TOTAL_SECTIONS = 5;
const SECTION_ABOUT = 0;
const SECTION_DOMINANT = 1;
const SECTION_AVERAGE = 2;
const SECTION_WEIGHTED = 3;
const SECTION_LIKED = 4;
const LIKED_IDS_STORAGE_KEY = "cs2-skins-liked-ids";
type ViewportBlockReason = "mobile" | "narrow" | null;

function ViewportNotice({ reason }: { reason: Exclude<ViewportBlockReason, null> }) {
  const Icon = reason === "mobile" ? Monitor : Maximize2;
  const message =
    reason === "mobile"
      ? "please open this website on a computer"
      : "please resize to full screen";

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-8 text-center">
      <div className="flex flex-col items-center gap-5">
        <Icon size="4.75rem" strokeWidth={1.15} className="text-gray-400" aria-hidden="true" />
        <p className="max-w-xs text-[1.125rem] font-light leading-relaxed tracking-wide text-gray-400">
          {message}
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  const [showMain, setShowMain] = useState(false);
  const [currentSection, setCurrentSection] = useState(SECTION_ABOUT);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likedIdsReady, setLikedIdsReady] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"whole" | "ingame">("whole");
  const [hasDraggedColorGraph, setHasDraggedColorGraph] = useState(false);
  const [viewportBlockReason, setViewportBlockReason] = useState<ViewportBlockReason>(null);

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const largestDesktopWidthRef = useRef(0);

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

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LIKED_IDS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setLikedIds(new Set(parsed.filter((id): id is string => typeof id === "string")));
        }
      }
    } catch {
      // Ignore unavailable or malformed localStorage and keep the in-memory set.
    } finally {
      setLikedIdsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!likedIdsReady) return;

    try {
      window.localStorage.setItem(LIKED_IDS_STORAGE_KEY, JSON.stringify(Array.from(likedIds)));
    } catch {
      // Persistence is best-effort; liking should still work if storage is unavailable.
    }
  }, [likedIds, likedIdsReady]);

  const handleColorGraphDrag = useCallback(() => {
    setHasDraggedColorGraph(true);
  }, []);

  useEffect(() => {
    const updateViewportBlock = () => {
      const width = window.innerWidth;
      const visualWidth = window.visualViewport?.width || width;
      const outerWidth = window.outerWidth || width;
      const screenWidth = window.screen?.availWidth || window.screen?.width || null;
      const measuredDesktopWidth = Math.max(screenWidth ?? 0, outerWidth, width);
      const userAgent = window.navigator?.userAgent ?? "";
      const hasMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const looksLikeDesktopWidth = measuredDesktopWidth >= 1200 || largestDesktopWidthRef.current >= 1200;
      const isMobile = hasMobileUserAgent && !looksLikeDesktopWidth;

      if (isMobile) {
        setViewportBlockReason("mobile");
        return;
      }

      largestDesktopWidthRef.current = Math.max(largestDesktopWidthRef.current, measuredDesktopWidth);

      const desktopWidth = largestDesktopWidthRef.current || measuredDesktopWidth;
      const narrowLimit = desktopWidth * 0.56;
      const isHalfScreenOrLess = Math.min(width, visualWidth, outerWidth) <= narrowLimit;

      setViewportBlockReason(isHalfScreenOrLess ? "narrow" : null);
    };

    updateViewportBlock();
    window.addEventListener("resize", updateViewportBlock);
    window.addEventListener("orientationchange", updateViewportBlock);
    window.visualViewport?.addEventListener("resize", updateViewportBlock);

    return () => {
      window.removeEventListener("resize", updateViewportBlock);
      window.removeEventListener("orientationchange", updateViewportBlock);
      window.visualViewport?.removeEventListener("resize", updateViewportBlock);
    };
  }, []);

  // Intersection observer — update active section dot
  useEffect(() => {
    if (!showMain) return;
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          // Use a center viewport band so tall sections can still become active.
          if (entry.isIntersecting) {
            setCurrentSection(i);
          }
        },
        {
          threshold: 0,
          rootMargin: "-45% 0px -45% 0px",
        }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [showMain]);

  if (viewportBlockReason) {
    return <ViewportNotice reason={viewportBlockReason} />;
  }

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
        <AboutSecNew
          title="ABOUT THIS PROJECT"
          titleClass="title-dom"
          subtitle="Learn about this project and how to use it"
          skins={dominantSkins}
          likedIds={likedIds}
          onLike={handleLike}
          onGoToLiked={() => scrollToSection(SECTION_LIKED)}
          analysisMode={analysisMode}
          onAnalysisModeChange={setAnalysisMode}
          sectionIndex={SECTION_ABOUT}
          stickerName="256fx256f"
          {...navProps}
        />
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
          showDragHint={!hasDraggedColorGraph}
          onGraphDrag={handleColorGraphDrag}
          sectionIndex={SECTION_DOMINANT}
          stickerName="260fx260f"
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
          showDragHint={!hasDraggedColorGraph}
          onGraphDrag={handleColorGraphDrag}
          sectionIndex={SECTION_AVERAGE}
          stickerName="smallpp"
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
          showDragHint={!hasDraggedColorGraph}
          onGraphDrag={handleColorGraphDrag}
          sectionIndex={SECTION_WEIGHTED}
          stickerName="360fx360f"
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
