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
  showDragHint?: boolean;
  onGraphDrag?: () => void;
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
const RAD2DEG = 180 / Math.PI;

type PreparedSkin = {
  skin: Skin;
  h: number;
  s: number;
  v: number;
  color: string;
  zIndex: number;
  circle: {
    x: number;
    y: number;
  };
  cone: {
    y: number;
    r: number;
    cos: number;
    sin: number;
  };
};

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

function normalizeAngleDelta(delta: number) {
  return ((((delta + 180) % 360) + 360) % 360) - 180;
}

function getInteractionLayer(skin: Skin, selectedId: string | null, highlightId: string | null, focusIds: Set<string> | null) {
  if (skin.id === selectedId) return 3;
  if (skin.id === highlightId || focusIds?.has(skin.id)) return 2;
  return 0;
}

function compareInteractionLayers(
  aSkin: Skin,
  bSkin: Skin,
  selectedId: string | null,
  highlightId: string | null,
  focusIds: Set<string> | null
) {
  return getInteractionLayer(aSkin, selectedId, highlightId, focusIds) - getInteractionLayer(bSkin, selectedId, highlightId, focusIds);
}

function compareDotLayers(
  a: PreparedSkin,
  b: PreparedSkin,
  selectedId: string | null,
  highlightId: string | null,
  focusIds: Set<string> | null
) {
  const layerOrder = compareInteractionLayers(a.skin, b.skin, selectedId, highlightId, focusIds);
  if (layerOrder !== 0) return layerOrder;
  if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
  return a.skin.id.localeCompare(b.skin.id);
}

export default function HSVCone({
  skins,
  selectedId,
  highlightId,
  focusIds = null,
  filterWeapon,
  onSelect,
  showDragHint = false,
  onGraphDrag,
  view,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const [tooltip, setTooltip] = useState<{
    skin: Skin;
    x: number;
    y: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [renderDragHint, setRenderDragHint] = useState(showDragHint);
  const svgRef = useRef<SVGSVGElement>(null);
  const coneCanvasRef = useRef<HTMLCanvasElement>(null);

  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const coneDrawRafRef = useRef<number | null>(null);
  const pendingClickIdRef = useRef<string | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const lastAngleRef = useRef(0);
  const dragNotifiedRef = useRef(false);
  const hoverRafRef = useRef<number | null>(null);
  const lastHoverPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showDragHint) {
      setRenderDragHint(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      setRenderDragHint(false);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [showDragHint]);

  const clientToCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = coneCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    };
  }, []);

  const clientToCircleAngle = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);
    return Math.atan2(y, x) * RAD2DEG;
  }, []);

  const scheduleRotationCommit = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      setRotation(rotationRef.current);
    });
  }, []);

  const notifyGraphDrag = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - dragStartXRef.current;
      const dy = clientY - dragStartYRef.current;
      if (dragNotifiedRef.current || dx * dx + dy * dy <= 16) return;
      dragNotifiedRef.current = true;
      onGraphDrag?.();
    },
    [onGraphDrag]
  );

  const visibleSkins = useMemo(() => {
    return filterWeapon ? skins.filter((s) => s.weapon === filterWeapon) : skins;
  }, [skins, filterWeapon]);

  const preparedSkins = useMemo<PreparedSkin[]>(() => {
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

      return { skin, h, s, v, color, zIndex: v, circle, cone };
    });
  }, [visibleSkins]);

  // Sort low-Value dots behind high-Value dots, with active dots still on top.
  const sortedSkins = useMemo(() => {
    const next = [...preparedSkins];
    next.sort((a, b) => compareDotLayers(a, b, selectedId, highlightId, focusIds));
    return next;
  }, [preparedSkins, selectedId, highlightId, focusIds]);

  const getConeRenderSkins = useCallback(
    (rotDeg: number) => {
      const rotRad = rotDeg * DEG2RAD;
      const sinRot = Math.sin(rotRad);
      const cosRot = Math.cos(rotRad);
      const next = [...preparedSkins];

      next.sort((a, b) => {
        const layerOrder = compareInteractionLayers(a.skin, b.skin, selectedId, highlightId, focusIds);
        if (layerOrder !== 0) return layerOrder;

        const aDepth = a.cone.r * (a.cone.cos * sinRot + a.cone.sin * cosRot);
        const bDepth = b.cone.r * (b.cone.cos * sinRot + b.cone.sin * cosRot);
        const aDepthIndex = a.zIndex + aDepth / (CONE_R * 4);
        const bDepthIndex = b.zIndex + bDepth / (CONE_R * 4);
        if (aDepthIndex !== bDepthIndex) return aDepthIndex - bDepthIndex;
        return a.skin.id.localeCompare(b.skin.id);
      });

      return next;
    },
    [preparedSkins, selectedId, highlightId, focusIds]
  );

  const getConePointAt = useCallback(
    (clientX: number, clientY: number) => {
      const point = clientToCanvasPoint(clientX, clientY);
      if (!point) return null;
      const { x, y } = point;

      const rotRad = rotationRef.current * DEG2RAD;
      const cosRot = Math.cos(rotRad);
      const sinRot = Math.sin(rotRad);

      const renderSkins = getConeRenderSkins(rotationRef.current);

      // Search top-most first using the same depth order as the canvas render.
      for (let i = renderSkins.length - 1; i >= 0; i--) {
        const { skin, cone } = renderSkins[i];
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
    [clientToCanvasPoint, getConeRenderSkins, selectedId]
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

    for (const { skin, color, cone } of getConeRenderSkins(rotationRef.current)) {
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
  }, [getConeRenderSkins, selectedId, highlightId, focusIds]);

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
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    lastAngleRef.current = clientToCircleAngle(e.clientX, e.clientY) ?? 0;
    dragNotifiedRef.current = false;
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
    dragStartYRef.current = e.clientY;
    dragNotifiedRef.current = false;
    lastXRef.current = e.clientX;
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setTooltip(null);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDraggingRef.current) return;
      const angle = clientToCircleAngle(e.clientX, e.clientY);
      if (angle === null) return;
      const delta = normalizeAngleDelta(angle - lastAngleRef.current);
      lastAngleRef.current = angle;
      rotationRef.current = rotationRef.current + delta;
      notifyGraphDrag(e.clientX, e.clientY);
      scheduleRotationCommit();
    },
    [clientToCircleAngle, notifyGraphDrag, scheduleRotationCommit]
  );

  const handleConePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isDraggingRef.current) {
        const delta = e.clientX - lastXRef.current;
        lastXRef.current = e.clientX;
        rotationRef.current = rotationRef.current - delta * 0.5;
        notifyGraphDrag(e.clientX, e.clientY);
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
    [getConePointAt, notifyGraphDrag, scheduleConeDraw]
  );

  const endDrag = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleConePointerCancel = useCallback(() => {
    isDraggingRef.current = false;
    pendingClickIdRef.current = null;
    dragNotifiedRef.current = false;
  }, []);

  const handleConePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const wasDragging = isDraggingRef.current;
      isDraggingRef.current = false;

      // Sync rotation state once so switching to circle view doesn't jump.
      setRotation(rotationRef.current);

      const clickId = pendingClickIdRef.current;
      pendingClickIdRef.current = null;
      dragNotifiedRef.current = false;

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
      {renderDragHint && (view === "cone" || view === "circle") && (
        <div
          className={`pointer-events-none hidden lg:block absolute -top-9 left-1/2 z-10 h-[52px] w-[230px] -translate-x-1/2 transition-opacity duration-700 ease-out ${
            showDragHint ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 230 52"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <marker id="hsv-drag-arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
              </marker>
            </defs>
            <path d="M 72 15 C 70 15, 66 22, 44 22" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#hsv-drag-arrow-head)" />
            <path d="M 158 15 C 160 15, 164 22, 186 22" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#hsv-drag-arrow-head)" />
          </svg>
          <span className="absolute left-1/2 top-0 w-full -translate-x-1/2 text-center text-[18px] font-light text-gray-400">
            Drag ME!
          </span>
        </div>
      )}

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
