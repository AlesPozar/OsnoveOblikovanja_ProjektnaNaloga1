"use client";
import { useState, useMemo, useCallback, useRef } from "react";
import { Eye, EyeOff, Star, ChevronDown } from "lucide-react";
import { Skin, getAllWeaponTypes, skinToColor } from "@/lib/skinData";
import SkinPanel from "./SkinPanel";

const LINKEDIN_URL = "https://www.linkedin.com/in/ale%C5%A1-po%C5%BEar-946854279/";

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
  const [likedOnlyActive, setLikedOnlyActive] = useState(false);
  const [stickerMessage, setStickerMessage] = useState<string | null>(null);
  const stickerTimerRef = useRef<number | null>(null);

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

  const showStickerMessage = useCallback(() => {
    setStickerMessage("raawww");
    if (stickerTimerRef.current !== null) {
      window.clearTimeout(stickerTimerRef.current);
    }
    stickerTimerRef.current = window.setTimeout(() => {
      setStickerMessage(null);
      stickerTimerRef.current = null;
    }, 1800);
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
      <header className="relative flex items-center px-10 py-4 mt-5">
        <h2
          className={`rainbow-title-safe absolute left-1/2 transform -translate-x-1/2 text-4xl sm:text-5xl min-w-[30rem] font-light italic text-center tracking-wider ${titleClass}`}
          style={{fontFamily: "inherit" }}
        >
          {title}
        </h2>

        <span className="absolute left-1/2 transform -translate-x-1/2 top-10 text-base font-light text-center tracking-wider text-gray-400">
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

        <div className={`${panelVisible ? "w-1/2" : "flex-1"} pointer-events-none min-w-0 flex flex-col items-center justify-center relative`}>
          <div className="relative flex flex-col items-center z-10 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center gap-6">
              <button
                onClick={toggleIngame}
                className={`flex flex-col items-center transition-colors ${ingameMode ? "text-foreground/80" : "text-foreground/30"} hover:text-foreground/70`}
                title={ingameMode ? "Showing in-game parts (click for whole)" : "Showing whole skin (click for in-game parts)"}
                aria-label="Toggle analysis region"
              >
                {ingameMode ? (
                  <img className="w-30 h-auto block" src="AKIkona/group-2.png" alt="In-game mode" />
                ) : (
                  <img className="w-30 h-auto block" src="AKIkona/group-3.png" alt="Whole gun mode" />
                )}
              </button>

              <div className="relative">
                <div className="flex flex-col items-start">
                  <span className="text-[11px] font-bold text-gray-400 tracking-widest mb-0.5 uppercase">by weapon:</span>
                  <button
                    className="flex items-center gap-1 text-2xl font-light text-gray-700 hover:text-gray-900 transition-colors"
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
                      className={`block w-full text-left px-3 py-1.5 text-sm font-light hover:bg-gray-50 transition-colors ${!filterWeapon ? "text-gray-900 font-medium" : "text-gray-500"}`}
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
                        className={`block w-full text-left px-3 py-1.5 text-sm font-light hover:bg-gray-50 transition-colors ${filterWeapon === w ? "text-gray-900 font-medium" : "text-gray-500"}`}
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
                  <span className="text-[11px] font-bold text-gray-400 tracking-widest mb-0.5 uppercase">highlight skin by name:</span>
                  <button
                    className="flex items-center gap-1 text-2xl font-light text-gray-700 hover:text-gray-900 transition-colors"
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
                      className={`block w-full text-left px-3 py-1.5 text-sm font-light hover:bg-gray-50 transition-colors ${!highlightId ? "text-gray-900 font-medium" : "text-gray-500"}`}
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
                          className={`block w-full text-left px-3 py-1.5 text-sm font-light hover:bg-gray-50 transition-colors ${highlightId === s?.id ? "text-gray-900 font-medium" : "text-gray-500"}`}
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
                onClick={() => {
                  setLikedOnlyActive((active) => !active);
                  setHighlightId(null);
                }}
                className="transition-transform hover:scale-110 ml-1"
                title="Highlight liked skins"
                aria-label="View liked skins"
                aria-pressed={likedOnlyActive}
              >
                <Star
                  size={26}
                  strokeWidth={1.6}
                  fill={likedOnlyActive ? "currentColor" : "none"}
                  className={likedOnlyActive || likedIds.size > 0 ? "text-yellow-400" : "text-yellow-300"}
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

                <path d="M 260 50 C 165 50, 172 105, 220 128" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#about-arrow-head)" />
                <path d="M 545 78 C 455 70, 468 109, 475 118" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#about-arrow-head)" />
                <path d="M 590 225 C 680 260, 675 230, 680 192" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#about-arrow-head)" />
                <path d="M 370 250 C 410 260, 380 200, 380 200'" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#about-arrow-head)" />

                <text x="270" y="42" fill="#9ca3af" fontSize="18" fontWeight="300" fontFamily="inherit">
                  <tspan x="270" dy="0">select if you want to analyse</tspan>
                  <tspan x="270" dy="22">whole gun, or only in game</tspan>
                  <tspan x="270" dy="22">visible parts</tspan>
                </text>

                <text x="555" y="70" fill="#9ca3af" fontSize="18" fontWeight="300" fontFamily="inherit">
                  <tspan x="555" dy="0">select the skin you want, and</tspan>
                  <tspan x="555" dy="22">preview others just like it</tspan>
                </text>

                <text x="460" y="180" fill="#9ca3af" fontSize="18" fontWeight="300" fontFamily="inherit">
                  <tspan x="460" dy="50">show only liked</tspan>
                </text>

                <text x="180" y="240" fill="#9ca3af" fontSize="18" fontWeight="300" fontFamily="inherit">
                  <tspan x="180" dy="0">if you are looking for a</tspan>
                  <tspan x="136" dy="22">specific weapon type, select</tspan>
                  <tspan x="309" dy="22">it here</tspan>
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
                  <span
                    className="block h-3.5 w-3.5 rounded-full"
                    style={{
                      backgroundColor:
                        likedOnlyActive && dotSkin && !likedIds.has(dotSkin.id) ? "#cccccc" : dotColor,
                      opacity: likedOnlyActive && dotSkin && !likedIds.has(dotSkin.id) ? 0.32 : 1,
                    }}
                  />
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
                  <span className="absolute left-100 top-0 text-[18px] font-light text-gray-400 w-full">Click ME!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-16 left-1/2 z-10 w-[min(58rem,calc(100%-7rem))] -translate-x-1/2 text-center text-[15px] font-light leading-relaxed text-gray-400 sm:bottom-20">
        <p>
          This project helps you explore hidden secrets of CS2/CSGO skins and their colors. Data was
          analysed from{" "}
          <a href="https://huggingface.co/datasets/While402/CounterStrike2Skins" target="_blank" rel="noreferrer">
            while402/counterstrike2skins
          </a>{" "}
          dataset. We analysed thousands of different skins for ingame weapons and knives. This
          project was made as part of a subject Design Basics at University of Ljubljana,{" "}
          <a href="https://www.fri.uni-lj.si/sl" target="_blank" rel="noreferrer">
            Faculty of Computer Science and Informatics
          </a>
          .
        </p>
      </div>

      <div className="absolute bottom-5 left-12 text-xs font-light text-gray-400 tracking-widest">
        by{" "}
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          Ale&#353;
        </a>{" "}
        and Domen
      </div>

      <div className="absolute bottom-4 right-6">
        <button
          type="button"
          onClick={showStickerMessage}
          className="relative block w-20 h-20"
          aria-label="Sticker easter egg"
        >
          {stickerMessage && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded border border-gray-100 bg-white px-2 py-1 text-sm font-semibold text-gray-600 shadow whitespace-nowrap">
              {stickerMessage}
            </span>
          )}
          <img
            src={`CS2Stickers/${stickerName}.png`}
            alt="CS2"
            className="w-full object-cover"
            style={{ objectPosition: "right bottom" }}
          />
        </button>
      </div>
    </div>
  );
}
