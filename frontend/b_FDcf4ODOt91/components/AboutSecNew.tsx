"use client";
import { useState, useMemo, useCallback } from "react";
import { Eye, EyeOff, Star, ChevronDown } from "lucide-react";
import { Skin, getAllWeaponTypes, skinToColor } from "@/lib/skinData";
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
  currentSection: number;
  totalSections: number;
  onNavClick: (i: number) => void;
  sectionIndex: number;
  stickerName: string;
}

function getRgbScore(color: string) {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (!match) return { red: 0, score: 0 };

  const red = Number(match[1]);
  const green = Number(match[2]);
  const blue = Number(match[3]);
  return {
    red,
    score: red - Math.max(green, blue),
  };
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
  stickerName,
}: Props) {
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [filterWeapon, setFilterWeapon] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [hasPickedFirstSkin, setHasPickedFirstSkin] = useState(false);
  const [weaponOpen, setWeaponOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [ingameMode, setIngameMode] = useState(false);

  const weaponTypes = useMemo(() => getAllWeaponTypes(skins), [skins]);

  const defaultDotSkin = useMemo(() => {
    if (skins.length === 0) return null;

    return skins.reduce<Skin | null>((best, skin) => {
      if (!best) return skin;

      const bestColor = getRgbScore(skinToColor(best));
      const nextColor = getRgbScore(skinToColor(skin));
      if (nextColor.score > bestColor.score) return skin;
      if (nextColor.score === bestColor.score && nextColor.red > bestColor.red) return skin;
      return best;
    }, null);
  }, [skins]);

  const dotSkin = selectedSkin ?? defaultDotSkin;
  const dotColor = dotSkin ? skinToColor(dotSkin) : "#d1d5db";

  const selectedNames = useMemo(() => {
    const base = filterWeapon ? skins.filter((s) => s.weapon === filterWeapon) : skins;
    return Array.from(new Set(base.map((s) => s.skinName))).sort();
  }, [skins, filterWeapon]);

  const handleSkinSelect = useCallback(
    (skin: Skin) => {
      setSelectedSkin(skin);
      if (!hasPickedFirstSkin) setHasPickedFirstSkin(true);
    },
    [hasPickedFirstSkin]
  );

  const handleDotClick = useCallback(() => {
    if (!dotSkin) return;
    setSelectedSkin(dotSkin);
    if (!hasPickedFirstSkin) setHasPickedFirstSkin(true);
    setPanelVisible(true);
  }, [dotSkin, hasPickedFirstSkin]);

  const closeDropdowns = useCallback(() => {
    setWeaponOpen(false);
    setNameOpen(false);
  }, []);

  const highlightedSkinName =
    highlightId ? (skins.find((s) => s.id === highlightId)?.skinName ?? "—") : "—";

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
      <header className="relative flex items-center px-6 py-4 mr-13 mt-5">
        <h2
          className={`absolute left-1/2 transform -translate-x-1/2 text-5xl min-w-[30rem] sm:text-4xl font-light italic text-center tracking-wider leading-none ${titleClass}`}
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontFamily: "inherit" }}
        >
          {title}
        </h2>

        <span className="absolute left-1/2 transform -translate-x-1/2 top-10 text-sm font-light text-center tracking-wider text-gray-400 pointer-events-none">
          {subtitle}
        </span>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {hasPickedFirstSkin && (
          <button
            onClick={() => setPanelVisible(!panelVisible)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors z-30"
            aria-label={panelVisible ? "Hide panel" : "Show panel"}
          >
            {panelVisible ? <EyeOff size={22} strokeWidth={1.4} /> : <Eye size={22} strokeWidth={1.4} />}
          </button>
        )}

        {panelVisible && (
          <div className="w-1/2 min-w-0 overflow-y-auto px-10 pt-4 m-40 center">
            <SkinPanel
              skin={selectedSkin}
              allSkins={skins}
              likedIds={likedIds}
              onLike={onLike}
              onSelect={handleSkinSelect}
            />
          </div>
        )}

        <div className={`${panelVisible ? "w-1/2" : "flex-1"} min-w-0 flex flex-col items-center justify-center relative`}>
          <div className="relative flex flex-col items-center z-10" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center gap-6">
              <button
                onClick={toggleIngame}
                className={`flex flex-col items-center transition-colors ${ingameMode ? "text-foreground/80" : "text-foreground/30"} hover:text-foreground/70`}
                title={ingameMode ? "Showing in-game parts (click for whole)" : "Showing whole skin (click for in-game parts)"}
                aria-label="Toggle analysis region"
              >
                {ingameMode ? (
                  <img className="w-35 h-19 mt-1" src="AKIkona/Screenshot 2026-05-05 232657.png" alt="In-game mode" />
                ) : (
                  <img className="w-35 h-20" src="AKIkona/Screenshot 2026-05-05 232438.png" alt="In-game mode" />
                )}
              </button>

              <div className="relative">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-gray-400 tracking-widest mb-0.5 uppercase">by weapon:</span>
                  <button
                    className="flex items-center gap-1 text-xl font-light text-gray-700 hover:text-gray-900 transition-colors"
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
                      className={`block w-full text-left px-3 py-1.5 text-xs font-light hover:bg-gray-50 transition-colors ${!filterWeapon ? "text-gray-900 font-medium" : "text-gray-500"}`}
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
                        className={`block w-full text-left px-3 py-1.5 text-xs font-light hover:bg-gray-50 transition-colors ${filterWeapon === w ? "text-gray-900 font-medium" : "text-gray-500"}`}
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

              <div className="relative">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-gray-400 tracking-widest mb-0.5 uppercase">highlight skin by name:</span>
                  <button
                    className="flex items-center gap-1 text-xl font-light text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNameOpen(!nameOpen);
                      setWeaponOpen(false);
                    }}
                  >
                    <span className="max-w-[15rem] truncate">{highlightedSkinName}</span>
                    <ChevronDown size={11} className="text-gray-400" />
                  </button>
                </div>
                {nameOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded shadow-xl z-50 max-h-64 overflow-y-auto w-56">
                    <button
                      className={`block w-full text-left px-3 py-1.5 text-xs font-light hover:bg-gray-50 transition-colors ${!highlightId ? "text-gray-900 font-medium" : "text-gray-500"}`}
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
                        (sk) => sk.skinName === name && (filterWeapon ? sk.weapon === filterWeapon : true)
                      );
                      return (
                        <button
                          key={name}
                          className={`block w-full text-left px-3 py-1.5 text-xs font-light hover:bg-gray-50 transition-colors ${highlightId === s?.id ? "text-gray-900 font-medium" : "text-gray-500"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextId = s?.id ?? null;
                            setHighlightId(nextId);
                            if (!hasPickedFirstSkin) setHasPickedFirstSkin(true);
                            if (s) setSelectedSkin(s);
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

              <button
                onClick={onGoToLiked}
                className="transition-transform hover:scale-110 ml-1"
                aria-label="View liked skins"
              >
                <Star
                  size={26}
                  strokeWidth={1.6}
                  fill="none"
                  className={likedIds.size > 0 ? "text-yellow-400" : "text-yellow-300"}
                />
              </button>
            </div>

            <div className="pointer-events-none hidden lg:block absolute -top-36 left-1/2 -translate-x-1/2 w-[920px] h-[360px]">
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 920 360"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <marker id="about-arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
                  </marker>
                </defs>

                <path d="M 340 50 C 240 50, 240 105, 280 128" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#about-arrow-head)" />
                <path d="M 680 78 C 581 70, 592 109, 590 118" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#about-arrow-head)" />
                <path d="M 440 250 C 380 260, 380 230, 390 220'" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#about-arrow-head)" />

                <text x="350" y="42" fill="#9ca3af" fontSize="16" fontWeight="300" fontFamily="inherit">
                  <tspan x="350" dy="0">select if you want to analyse</tspan>
                  <tspan x="350" dy="22">whole gun, or only in game</tspan>
                  <tspan x="350" dy="22">visible parts</tspan>
                </text>

                <text x="690" y="70" fill="#9ca3af" fontSize="16" fontWeight="300" fontFamily="inherit">
                  <tspan x="690" dy="0">select the skin you want, and</tspan>
                  <tspan x="690" dy="22">preview others just like it</tspan>
                </text>

                <text x="450" y="240" fill="#9ca3af" fontSize="16" fontWeight="300" fontFamily="inherit">
                  <tspan x="450" dy="0">if you are looking for a</tspan>
                  <tspan x="450" dy="22">specific weapon type, select</tspan>
                  <tspan x="450" dy="22">it here</tspan>
                </text>
              </svg>
            </div>

            {dotSkin && (
              <div className="relative mt-50 -translate-x-36">
                <button
                  type="button"
                  onClick={handleDotClick}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-transform hover:scale-110"
                  aria-label={`Open side view for ${dotSkin.weapon} | ${dotSkin.skinName}`}
                  title={`${dotSkin.weapon} | ${dotSkin.skinName}`}
                >
                  <span className="block h-3.5 w-3.5 rounded-full" style={{ backgroundColor: dotColor }} />
                </button>
                <div className="pointer-events-none hidden lg:block absolute -left-52 -top-12 w-[440px] h-[120px]">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 440 120" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                      <marker id="about-arrow-head-dot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
                      </marker>
                    </defs>
                    <path d="M 410 25 C 350 80, 290 40, 245 60" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#about-arrow-head-dot)" />
                  </svg>
                  <span className="absolute left-100 top-0 text-[16px] font-light text-gray-400 w-full">Click ME!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-6 text-[11px] font-light text-gray-400 tracking-widest">
        by Ale&#353; and Domen
      </div>

      <div className="absolute bottom-4 right-16">
        <div className="w-20 h-20">
          <img
            src={`CS2Stickers/${stickerName}.png`}
            alt="CS2"
            className="w-full object-cover"
            style={{ objectPosition: "right bottom" }}
          />
        </div>
      </div>
    </div>
  );
}
