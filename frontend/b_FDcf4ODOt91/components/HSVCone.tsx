"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { Skin, skinToColor } from "@/lib/skinData";

interface Props {
  skins: Skin[];
  selectedId: string | null;
  highlightId: string | null;
  filterWeapon: string | null;
  onSelect: (skin: Skin) => void;
  view: "cone" | "circle";
}

const W = 520;
const H = 520;
const CX = W / 2;
const CY = H / 2;

// Cone geometry
const CONE_TOP_Y = 30;    // top circle center Y (high saturation, high value)
const CONE_BOT_Y = 490;   // tip Y (value = 0 → black)
const CONE_R = 220;       // max radius at top

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function normalizeHue(h: number) {
  if (!Number.isFinite(h)) return 0;
  if (Math.abs(h) > 1) {
    return (((h % 360) + 360) % 360) / 360;
  }
  return ((h % 1) + 1) % 1;
}

function normalizeValue(v: number) {
  if (!Number.isFinite(v)) return 0;
  return v > 1 ? clamp01(v / 255) : clamp01(v);
}

function normalizeHSV(h: number, s: number, v: number) {
  return {
    h: normalizeHue(h),
    s: clamp01(s),
    v: normalizeValue(v),
  };
}

// Project a skin's HSV onto the 2D cone
// hue → angle around the circle at the top
// value → Y position (0=tip, 1=top)
// saturation → radial offset from center axis (proportional to the slice radius at that value)
function hsvToConeXY(h: number, s: number, v: number, rotDeg: number) {
  const hueDeg = h * 360;
  // v=1 → top, v=0 → tip (bottom)
  const y = CONE_BOT_Y - (CONE_BOT_Y - CONE_TOP_Y) * v;
  // radius of the slice at value v scales linearly
  const sliceR = CONE_R * v;
  const r = sliceR * s;
  const angleRad = ((hueDeg + rotDeg) * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(angleRad),
    y,
  };
}

// Project HSV onto 2D circle using hue as angle and saturation as radius.
// A small minimum radius keeps low-saturation skins visible instead of collapsing to the center.
function hsvToCircleXY(h: number, s: number, rotDeg: number) {
  const CIRCLE_R = 220;
  const angleRad = (((h * 360) - 90 + rotDeg) * Math.PI) / 180;
  const spread = Math.pow(clamp01(s), 0.75);
  const r = CIRCLE_R * (0.08 + 0.92 * spread);
  return {
    x: CX + r * Math.cos(angleRad),
    y: CY + r * Math.sin(angleRad),
  };
}

export default function HSVCone({
  skins,
  selectedId,
  highlightId,
  filterWeapon,
  onSelect,
  view,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [tooltip, setTooltip] = useState<{
    skin: Skin;
    x: number;
    y: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element).closest(".skin-dot")) return;
    setIsDragging(true);
    setLastX(e.clientX);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - lastX;
      setRotation((r) => r + delta * 0.5);
      setLastX(e.clientX);
    },
    [isDragging, lastX]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setLastX(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const delta = e.touches[0].clientX - lastX;
      setRotation((r) => r + delta * 0.5);
      setLastX(e.touches[0].clientX);
    },
    [isDragging, lastX]
  );

  useEffect(() => {
    const onUp = () => setIsDragging(false);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const visibleSkins = filterWeapon
    ? skins.filter((s) => s.weapon === filterWeapon)
    : skins;

  // Sort so dimmed dots render first, selected dot last (on top)
  const sortedSkins = [...visibleSkins].sort((a, b) => {
    const aScore = a.id === selectedId ? 2 : a.id === highlightId ? 1 : 0;
    const bScore = b.id === selectedId ? 2 : b.id === highlightId ? 1 : 0;
    return aScore - bScore;
  });

  const circleGuideR = 220;

  return (
    <div className="relative select-none w-full flex justify-center items-center">
      <svg
        ref={svgRef}
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        {view === "circle" && (
          <g opacity={0.95}>
            <circle
              cx={CX}
              cy={CY}
              r={circleGuideR}
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(107,114,128,0.28)"
              strokeWidth={1.25}
            />
            <circle
              cx={CX}
              cy={CY}
              r={circleGuideR - 58}
              fill="none"
              stroke="rgba(156,163,175,0.14)"
              strokeWidth={1}
              strokeDasharray="3 7"
            />
          </g>
        )}
        {sortedSkins.map((skin) => {
          // Guard against invalid HSV values
          const { h, s, v } = normalizeHSV(skin.hue, skin.saturation, skin.value);
          const pos =
            view === "cone"
              ? hsvToConeXY(h, s, v, rotation)
              : hsvToCircleXY(h, s, rotation);

            const color = skinToColor({ ...skin, hue: h, saturation: s, value: v });
          const isSelected = skin.id === selectedId;
          const isHighlighted = skin.id === highlightId;
          const isDimmed = highlightId !== null && !isHighlighted;

          return (
            <circle
              key={skin.id}
              className="skin-dot"
              cx={pos.x}
              cy={pos.y}
              r={view === "circle" ? (isSelected ? 8 : 5) : isSelected ? 7 : 4}
              fill={isDimmed ? "#cccccc" : color}
              paintOrder="stroke fill"
              stroke={
                isSelected
                  ? "rgba(0,0,0,0.8)"
                  : isHighlighted
                  ? "rgba(0,0,0,0.55)"
                  : view === "circle"
                  ? "rgba(0,0,0,0.32)"
                  : "rgba(0,0,0,0.18)"
              }
              strokeWidth={
                isSelected ? 1.6 : isHighlighted ? 1.4 : view === "circle" ? 1 : 0.5
              }
              opacity={isDimmed ? 0.32 : 1}
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                const svg = svgRef.current;
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                setTooltip({
                  skin,
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(skin);
                setTooltip(null);
              }}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-30 bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
        >
          <span className="font-medium text-gray-800">{tooltip.skin.weapon}</span>
          <span className="text-gray-400 mx-1">|</span>
          <span className="text-gray-600">{tooltip.skin.skinName}</span>
        </div>
      )}
    </div>
  );
}
