"use client";
import { useState, useMemo, useCallback } from "react";
import { Eye, EyeOff, Star, ChevronDown } from "lucide-react";
import { Skin, getAllWeaponTypes, skinToColor } from "@/lib/skinData";
import HSVCone from "./HSVCone";
import SkinPanel from "./SkinPanel";

interface Props {
  title: string;
  titleClass: string;
  subtitle: string;
  skins: Skin[];
  likedIds: Set<string>;
  onLike: (id: string) => void;
  onGoToLiked: () => void;
  analysisMode: "whole" | "ingame";
  onAnalysisModeChange: (mode: "whole" | "ingame") => void;
  // side nav
  currentSection: number;
  totalSections: number;
  onNavClick: (i: number) => void;
  sectionIndex: number;
}

// AK-47 silhouette SVG path
function AK47Icon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 30" className={className} fill="currentColor">
      <rect x="2" y="13" width="48" height="5" rx="1.5" />
      <rect x="46" y="10" width="28" height="11" rx="2" />
      <rect x="20" y="18" width="8" height="11" rx="1.5" />
      <rect x="1" y="13.5" width="5" height="4" rx="1" />
      <rect x="68" y="11" width="4" height="4" rx="0.8" />
      <rect x="36" y="9" width="3" height="3" rx="0.5" />
    </svg>
  );
}

export default function ColorSection({
  title,
  titleClass,
  subtitle,
  skins,
  likedIds,
  onLike,
  onGoToLiked,
  analysisMode,
  onAnalysisModeChange,
  currentSection,
  totalSections,
  onNavClick,
  sectionIndex,
}: Props) {
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [filterWeapon, setFilterWeapon] = useState<string | null>(null);
  const [view, setView] = useState<"cone" | "circle">("cone");
  const [panelVisible, setPanelVisible] = useState(true);
  const [weaponOpen, setWeaponOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [ingameMode, setIngameMode] = useState(false);

  const weaponTypes = useMemo(() => getAllWeaponTypes(skins), [skins]);

  const selectedNames = useMemo(() => {
    const base = filterWeapon ? skins.filter((s) => s.weapon === filterWeapon) : skins;
    return Array.from(new Set(base.map((s) => s.skinName))).sort();
  }, [skins, filterWeapon]);

  const handleSkinSelect = useCallback(
    (skin: Skin) => {
      setSelectedSkin(skin);
      if (!panelVisible) setPanelVisible(true);
    },
    [panelVisible]
  );

  const closeDropdowns = useCallback(() => {
    setWeaponOpen(false);
    setNameOpen(false);
  }, []);

  const highlightedSkinName =
    highlightId
      ? (skins.find((s) => s.id === highlightId)?.skinName ?? "—")
      : "—";

  const toggleIngame = useCallback(() => {
    const next = !ingameMode;
    setIngameMode(next);
    onAnalysisModeChange(next ? "ingame" : "whole");
  }, [ingameMode, onAnalysisModeChange]);

  return (
    <div
      className="relative w-full h-screen flex flex-col bg-background overflow-hidden"
      onClick={closeDropdowns}
    >
      {/* ── TOP BAR ── */}
      <header className="relative flex items-center justify-between px-6 py-4 flex-shrink-0">
        {/* Left: rainbow title */}
        <h2
          className={`text-3xl sm:text-4xl font-light italic tracking-wide leading-none ${titleClass}`}
          style={{ fontFamily: "inherit" }}
        >
          {title}
        </h2>

        {/* Center: subtitle (absolutely centered) */}
        <span className="absolute left-0 right-0 text-center text-sm font-light tracking-wider text-gray-400 pointer-events-none">
          {subtitle}
        </span>

        {/* Right: controls */}
        <div
          className="flex items-center gap-6 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* AK-47 toggle: whole vs ingame */}
          <button
            onClick={toggleIngame}
            className={`flex flex-col items-center transition-colors ${
              ingameMode ? "text-foreground/80" : "text-foreground/30"
            } hover:text-foreground/70`}
            title={ingameMode ? "Showing in-game parts (click for whole)" : "Showing whole skin (click for in-game parts)"}
            aria-label="Toggle analysis region"
          >
            <AK47Icon className="w-14 h-6" />
          </button>

          {/* by weapon dropdown */}
          <div className="relative">
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-gray-400 tracking-widest mb-0.5 uppercase">
                by weapon:
              </span>
              <button
                className="flex items-center gap-1 text-sm font-light text-gray-700 hover:text-gray-900 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setWeaponOpen(!weaponOpen);
                  setNameOpen(false);
                }}
              >
                {filterWeapon ?? "All"}
                <ChevronDown size={11} className="text-gray-400" />
              </button>
            </div>
            {weaponOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded shadow-xl z-50 max-h-64 overflow-y-auto w-44">
                <button
                  className={`block w-full text-left px-3 py-1.5 text-xs font-light hover:bg-gray-50 transition-colors ${
                    !filterWeapon ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterWeapon(null);
                    setWeaponOpen(false);
                  }}
                >
                  All
                </button>
                {weaponTypes.map((w) => (
                  <button
                    key={w}
                    className={`block w-full text-left px-3 py-1.5 text-xs font-light hover:bg-gray-50 transition-colors ${
                      filterWeapon === w ? "text-gray-900 font-medium" : "text-gray-500"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterWeapon(w);
                      setWeaponOpen(false);
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* highlight skin by name dropdown */}
          <div className="relative">
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-gray-400 tracking-widest mb-0.5 uppercase">
                highlight skin by name:
              </span>
              <button
                className="flex items-center gap-1 text-sm font-light text-gray-700 hover:text-gray-900 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setNameOpen(!nameOpen);
                  setWeaponOpen(false);
                }}
              >
                <span className="max-w-[9rem] truncate">{highlightedSkinName}</span>
                <ChevronDown size={11} className="text-gray-400" />
              </button>
            </div>
            {nameOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded shadow-xl z-50 max-h-64 overflow-y-auto w-56">
                <button
                  className={`block w-full text-left px-3 py-1.5 text-xs font-light hover:bg-gray-50 transition-colors ${
                    !highlightId ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setHighlightId(null);
                    setNameOpen(false);
                  }}
                >
                  None
                </button>
                {selectedNames.map((name) => {
                  const s = skins.find(
                    (sk) =>
                      sk.skinName === name &&
                      (filterWeapon ? sk.weapon === filterWeapon : true)
                  );
                  return (
                    <button
                      key={name}
                      className={`block w-full text-left px-3 py-1.5 text-xs font-light hover:bg-gray-50 transition-colors ${
                        highlightId === s?.id
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHighlightId(s?.id ?? null);
                        setNameOpen(false);
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Star → liked */}
          <button
            onClick={onGoToLiked}
            className="transition-transform hover:scale-110 ml-1"
            aria-label="View liked skins"
          >
            <Star
              size={26}
              className={
                likedIds.size > 0
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-yellow-200 text-yellow-300"
              }
            />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left side: eye toggle (fixed, vertically centered) */}
        <button
          onClick={() => setPanelVisible(!panelVisible)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors z-30"
          aria-label={panelVisible ? "Hide panel" : "Show panel"}
        >
          {panelVisible ? (
            <EyeOff size={22} strokeWidth={1.4} />
          ) : (
            <Eye size={22} strokeWidth={1.4} />
          )}
        </button>

        {/* Left column: skin panel (hidden when panelVisible is false) */}
        {panelVisible && (
          <div className="flex flex-col items-start pl-20 pt-2 flex-shrink-0 w-[300px] overflow-y-auto">
            <SkinPanel
              skin={selectedSkin}
              allSkins={skins}
              likedIds={likedIds}
              onLike={onLike}
              onSelect={handleSkinSelect}
            />
          </div>
        )}

        {/* Center: visualization (expands when panel is hidden) */}
        <div className={`${panelVisible ? "flex-1" : "flex-1"} flex flex-col items-center justify-center relative`}>
          {ingameMode ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-xl font-light italic text-gray-400 tracking-wide">
                Coming soon
              </p>
              <p className="text-sm font-light text-gray-300">
                In-game visible parts analysis is not yet available
              </p>
            </div>
          ) : (
            <>
              <HSVCone
                skins={skins}
                selectedId={selectedSkin?.id ?? null}
                highlightId={highlightId}
                filterWeapon={filterWeapon}
                onSelect={handleSkinSelect}
                view={view}
              />

              {/* View toggle: cone / circle */}
              <div className="flex items-center gap-6 mt-2">
                {/* Cone icon */}
                <button
                  onClick={() => setView("cone")}
                  title="HSV Cone"
                  aria-label="Cone view"
                  className={`transition-opacity ${
                    view === "cone" ? "opacity-100" : "opacity-25 hover:opacity-50"
                  }`}
                >
                  <svg
                    viewBox="0 0 28 28"
                    width="30"
                    height="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    className="text-gray-600"
                  >
                    {/* cone: triangle + ellipse top */}
                    <line x1="14" y1="25" x2="3" y2="7" />
                    <line x1="14" y1="25" x2="25" y2="7" />
                    <ellipse cx="14" cy="7" rx="11" ry="3.5" />
                  </svg>
                </button>

                {/* Circle icon */}
                <button
                  onClick={() => setView("circle")}
                  title="HSV Circle"
                  aria-label="Circle view"
                  className={`transition-opacity ${
                    view === "circle" ? "opacity-100" : "opacity-25 hover:opacity-50"
                  }`}
                >
                  <svg
                    viewBox="0 0 28 28"
                    width="30"
                    height="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    className="text-gray-600"
                  >
                    <circle cx="14" cy="14" r="11" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right: spacer for nav dots */}
        <div className="w-14 flex-shrink-0" />
      </div>

      {/* ── BOTTOM LEFT: authors ── */}
      <div className="absolute bottom-5 left-6 text-[11px] font-light text-gray-400 tracking-widest">
        by Domen and Ale&#353;
      </div>

      {/* ── BOTTOM RIGHT: CS2 sticker ── */}
      <div className="absolute bottom-4 right-16">
        <div className="w-11 h-11 rounded-full overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bUgLDwK3oHxbpuWIRyIG06SnbOFWEv.png"
            alt="CS2"
            className="w-full h-full object-cover"
            style={{ objectPosition: "right bottom" }}
          />
        </div>
      </div>

      {/* ── RIGHT SIDE: nav dots (fixed to this section's right edge) ── */}
      <nav
        className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40"
        aria-label="Section navigation"
      >
        {Array.from({ length: totalSections }).map((_, i) => (
          <button
            key={i}
            onClick={() => onNavClick(i)}
            aria-label={`Section ${i + 1}`}
            className="flex items-center justify-center"
          >
            <span
              className={`block rounded-full border transition-all duration-200 ${
                currentSection === i
                  ? "w-4 h-4 border-gray-500"
                  : "w-2.5 h-2.5 border-gray-300 hover:border-gray-500"
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  );
}
