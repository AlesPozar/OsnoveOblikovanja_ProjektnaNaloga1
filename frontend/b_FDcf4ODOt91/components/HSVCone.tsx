"use client";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Skin, hsvToRgb } from "@/lib/skinData";

interface Props {
  skins: Skin[];
  selectedId: string | null;
  highlightId: string | null;
  focusIds?: Set<string> | null;
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

const DEG2RAD = Math.PI / 180;

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
  const angleRad = (hueDeg + rotDeg) * DEG2RAD;
  return {
    x: CX + r * Math.cos(angleRad),
    y,
  };
}

// Project HSV onto 2D circle using hue as angle and saturation as radius.
// A small minimum radius keeps low-saturation skins visible instead of collapsing to the center.
function hsvToCircleXY(h: number, s: number, rotDeg: number) {
  const CIRCLE_R = 220;
  const angleRad = ((h * 360) - 90 + rotDeg) * DEG2RAD;
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
  focusIds = null,
  filterWeapon,
  onSelect,
  view,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const [tooltip, setTooltip] = useState<{
    skin: Skin;
    x: number;
    y: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const coneCanvasRef = useRef<HTMLCanvasElement>(null);

  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const coneDrawRafRef = useRef<number | null>(null);
  const pendingClickIdRef = useRef<string | null>(null);
  const dragStartXRef = useRef(0);
  const hoverRafRef = useRef<number | null>(null);
  const lastHoverPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clientToCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = coneCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    };
  }, []);

  const scheduleRotationCommit = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      setRotation(rotationRef.current);
    });
  }, []);

  const visibleSkins = useMemo(() => {
    return filterWeapon ? skins.filter((s) => s.weapon === filterWeapon) : skins;
  }, [skins, filterWeapon]);

  const preparedSkins = useMemo(() => {
    return visibleSkins.map((skin) => {
      const { h, s, v } = normalizeHSV(skin.hue, skin.saturation, skin.value);

      // Base color from normalized HSV
      const [r, g, b] = hsvToRgb(h, s, v);
      const color = `rgb(${r},${g},${b})`;

      // Circle base position (rotation is applied via <g transform="rotate(...)"/>)
      const spread = Math.pow(clamp01(s), 0.75);
      const circleR = 220 * (0.08 + 0.92 * spread);
      const circleAngleRad = (h * 360 - 90) * DEG2RAD;
      const circle = {
        x: CX + circleR * Math.cos(circleAngleRad),
        y: CY + circleR * Math.sin(circleAngleRad),
      };

      // Cone base params (only x depends on rotation)
      const coneY = CONE_BOT_Y - (CONE_BOT_Y - CONE_TOP_Y) * v;
      const sliceR = CONE_R * v;
      const coneR = sliceR * s;
      const coneThetaRad = (h * 360) * DEG2RAD;
      const cone = {
        y: coneY,
        r: coneR,
        cos: Math.cos(coneThetaRad),
        sin: Math.sin(coneThetaRad),
      };

      return { skin, h, s, v, color, circle, cone };
    });
  }, [visibleSkins]);

  // Sort so dimmed dots render first, selected dot last (on top)
  const sortedSkins = useMemo(() => {
    const next = [...preparedSkins];
    next.sort((a, b) => {
      const aScore =
        a.skin.id === selectedId ? 3 : a.skin.id === highlightId || focusIds?.has(a.skin.id) ? 2 : 0;
      const bScore =
        b.skin.id === selectedId ? 3 : b.skin.id === highlightId || focusIds?.has(b.skin.id) ? 2 : 0;
      return aScore - bScore;
    });
    return next;
  }, [preparedSkins, selectedId, highlightId, focusIds]);

  const getConePointAt = useCallback(
    (clientX: number, clientY: number) => {
      const point = clientToCanvasPoint(clientX, clientY);
      if (!point) return null;
      const { x, y } = point;

      const rotRad = rotationRef.current * DEG2RAD;
      const cosRot = Math.cos(rotRad);
      const sinRot = Math.sin(rotRad);

      // Search top-most first (selected/highlight are rendered later)
      for (let i = sortedSkins.length - 1; i >= 0; i--) {
        const { skin, cone } = sortedSkins[i];
        const px = CX + cone.r * (cone.cos * cosRot - cone.sin * sinRot);
        const py = cone.y;
        const r = skin.id === selectedId ? 7 : 4;
        const hitR = r + 2; // small padding for easier selection
        const dx = x - px;
        const dy = y - py;
        if (dx * dx + dy * dy <= hitR * hitR) {
          return { skin, x, y };
        }
      }

      return null;
    },
    [clientToCanvasPoint, sortedSkins, selectedId]
  );

  const drawCone = useCallback(() => {
    const canvas = coneCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(2, Math.max(1, rawDpr));
    const expectedW = Math.round(W * dpr);
    const expectedH = Math.round(H * dpr);
    if (canvas.width !== expectedW || canvas.height !== expectedH) {
      canvas.width = expectedW;
      canvas.height = expectedH;
    }

    // Reset transform and scale for crisp rendering on HiDPI.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const rotRad = rotationRef.current * DEG2RAD;
    const cosRot = Math.cos(rotRad);
    const sinRot = Math.sin(rotRad);
    const hasFocusIds = Boolean(focusIds && focusIds.size > 0);

    for (const { skin, color, cone } of sortedSkins) {
      const isSelected = skin.id === selectedId;
      const isHighlighted = skin.id === highlightId;
      const isFocused = focusIds?.has(skin.id) ?? false;
      const isDimmed = (highlightId !== null && !isHighlighted) || (hasFocusIds && !isFocused);

      const x = CX + cone.r * (cone.cos * cosRot - cone.sin * sinRot);
      const y = cone.y;
      const r = isSelected ? 7 : 4;

      ctx.globalAlpha = isDimmed ? 0.32 : 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = isDimmed ? "#cccccc" : color;
      ctx.fill();

      ctx.lineWidth = isSelected ? 1.6 : isHighlighted ? 1.4 : 0.5;
      ctx.strokeStyle = isSelected
        ? "rgba(0,0,0,0.8)"
        : isHighlighted
        ? "rgba(0,0,0,0.55)"
        : "rgba(0,0,0,0.18)";
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [sortedSkins, selectedId, highlightId, focusIds]);

  const scheduleConeDraw = useCallback(() => {
    if (coneDrawRafRef.current !== null) return;
    coneDrawRafRef.current = window.requestAnimationFrame(() => {
      coneDrawRafRef.current = null;
      drawCone();
    });
  }, [drawCone]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest(".skin-dot")) return;
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    setTooltip(null);
  };

  const handleConePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const hit = getConePointAt(e.clientX, e.clientY);
    if (hit) {
      pendingClickIdRef.current = hit.skin.id;
      setTooltip({ skin: hit.skin, x: e.clientX, y: e.clientY });
      return;
    }

    pendingClickIdRef.current = null;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setTooltip(null);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDraggingRef.current) return;
      const delta = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      rotationRef.current = rotationRef.current + delta * 0.5;
      scheduleRotationCommit();
    },
    [scheduleRotationCommit]
  );

  const handleConePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isDraggingRef.current) {
        const delta = e.clientX - lastXRef.current;
        lastXRef.current = e.clientX;
        rotationRef.current = rotationRef.current + delta * 0.5;
        scheduleConeDraw();
        setTooltip((prev) => (prev ? null : prev));
        return;
      }

      // Hover hit-testing (throttled to rAF)
      lastHoverPosRef.current = { x: e.clientX, y: e.clientY };
      if (hoverRafRef.current !== null) return;
      hoverRafRef.current = window.requestAnimationFrame(() => {
        hoverRafRef.current = null;
        if (isDraggingRef.current) return;
        const pos = lastHoverPosRef.current;
        if (!pos) return;
        const hit = getConePointAt(pos.x, pos.y);
        if (!hit) {
          setTooltip(null);
          return;
        }
        setTooltip({ skin: hit.skin, x: pos.x, y: pos.y });
      });
    },
    [getConePointAt, scheduleConeDraw]
  );

  const endDrag = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleConePointerCancel = useCallback(() => {
    isDraggingRef.current = false;
    pendingClickIdRef.current = null;
  }, []);

  const handleConePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const wasDragging = isDraggingRef.current;
      isDraggingRef.current = false;

      // Sync rotation state once so switching to circle view doesn't jump.
      setRotation(rotationRef.current);

      const clickId = pendingClickIdRef.current;
      pendingClickIdRef.current = null;

      // If pointer moved significantly, treat it as a drag.
      if (wasDragging && Math.abs(e.clientX - dragStartXRef.current) > 4) {
        return;
      }

      if (clickId) {
        const hit = getConePointAt(e.clientX, e.clientY);
        if (hit && hit.skin.id === clickId) {
          setTooltip(null);
          lastHoverPosRef.current = null;
          onSelect(hit.skin);
        }
      }
    },
    [getConePointAt, onSelect]
  );

  useEffect(() => {
    const onUp = () => endDrag();
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [endDrag]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (coneDrawRafRef.current !== null) {
        window.cancelAnimationFrame(coneDrawRafRef.current);
      }
      if (hoverRafRef.current !== null) {
        window.cancelAnimationFrame(hoverRafRef.current);
      }
    };
  }, []);

  const circleDots = useMemo(() => {
    if (view !== "circle") return null;
    const hasFocusIds = Boolean(focusIds && focusIds.size > 0);
    return sortedSkins.map(({ skin, color, circle }) => {
      const isSelected = skin.id === selectedId;
      const isHighlighted = skin.id === highlightId;
      const isFocused = focusIds?.has(skin.id) ?? false;
      const isDimmed = (highlightId !== null && !isHighlighted) || (hasFocusIds && !isFocused);

      return (
        <circle
          key={skin.id}
          className="skin-dot"
          cx={circle.x}
          cy={circle.y}
          r={isSelected ? 8 : 5}
          fill={isDimmed ? "#cccccc" : color}
          paintOrder="stroke fill"
          stroke={
            isSelected
              ? "rgba(0,0,0,0.8)"
              : isHighlighted
              ? "rgba(0,0,0,0.55)"
              : "rgba(0,0,0,0.32)"
          }
          strokeWidth={isSelected ? 1.6 : isHighlighted ? 1.4 : 1}
          opacity={isDimmed ? 0.32 : 1}
          style={{ cursor: "pointer" }}
          onMouseEnter={(e) => {
            if (isDraggingRef.current) return;
            setTooltip({
              skin,
              x: e.clientX,
              y: e.clientY,
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
    });
  }, [view, sortedSkins, selectedId, highlightId, focusIds, onSelect]);

  // Keep the canvas in sync with latest data.
  useEffect(() => {
    if (view !== "cone") return;
    drawCone();
  }, [view, drawCone]);

  // Keep circle view rotation in sync when switching views.
  useEffect(() => {
    if (view !== "circle") return;
    setRotation(rotationRef.current);
  }, [view]);

  return (
    <div className="relative select-none w-full flex justify-center items-center">
      {view === "circle" ? (
        <svg
          ref={svgRef}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <g transform={`rotate(${rotation} ${CX} ${CY})`}>{circleDots}</g>
        </svg>
      ) : (
        <canvas
          ref={coneCanvasRef}
          className="cursor-grab active:cursor-grabbing touch-none"
          style={{ width: W, height: H }}
          onPointerDown={handleConePointerDown}
          onPointerMove={handleConePointerMove}
          onPointerUp={handleConePointerUp}
          onPointerCancel={handleConePointerCancel}
        />
      )}

      {mounted && tooltip && createPortal(
        <div
          className="pointer-events-none fixed z-[100] bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs shadow-lg whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 42,
            transform: "translateX(-50%)",
          }}
        >
          <span className="font-medium text-gray-800">{tooltip.skin.weapon}</span>
          <span className="text-gray-400 mx-1">|</span>
          <span className="text-gray-600">{tooltip.skin.skinName}</span>
        </div>,
        document.body
      )}
    </div>
  );
}
