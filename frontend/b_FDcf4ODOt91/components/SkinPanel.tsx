"use client";
import { Star } from "lucide-react";
import { Skin, skinToColor, findSimilarSkins, RARITY_COLORS } from "@/lib/skinData";
import { GunLarge, GunSmall } from "./GunPlaceholder";
import SteamMarketLink from "./SteamMarketLink";

interface Props {
  skin: Skin | null;
  allSkins: Skin[];
  likedIds: Set<string>;
  onLike: (id: string) => void;
  onSelect: (skin: Skin) => void;
}

export default function SkinPanel({
  skin,
  allSkins,
  likedIds,
  onLike,
  onSelect,
}: Props) {
  if (!skin) return null;

  const color = skinToColor(skin);
  const isLiked = likedIds.has(skin.id);
  const similar = findSimilarSkins(skin, allSkins, 10);
  const rarityColor = RARITY_COLORS[skin.rarity] || "#aaa";

  return (
    <div className="relative flex w-full flex-col gap-3">
      <SteamMarketLink skin={skin} className="absolute left-0 top-0 z-40" />
      {/* Star like button — top-right of panel */}
      <button
        onClick={() => onLike(skin.id)}
        className="absolute right-0 top-0 p-1 transition-transform hover:scale-110 z-40"
        aria-label={isLiked ? "Unlike this skin" : "Like this skin"}
      >
        <Star
          size={24}
          strokeWidth={1.2}
          className={
            isLiked
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 fill-transparent"
          }
        />
      </button>

      {/* Main weapon image */}
      <div
        className="w-full aspect-[16/9] rounded flex items-center justify-center overflow-hidden p-1"
        style={{ background: `${color}18` }}
      >
        <div className="relative w-full h-full">
          <img
            src={`/CS2Skins/${skin.imageId}.png`}
            alt={`${skin.weapon} | ${skin.skinName}`}
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
            loading="eager"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {/* Fallback silhouette (renders behind if image is missing)
          <div className="absolute inset-0 flex items-center justify-center">
            <GunLarge color={color} />
          </div> */}
        </div>
      </div>

      {/* Skin name + weapon */}
      <div className="text-left">
        <p className="text-[0.6875rem] font-light text-gray-400 tracking-wide">
          {skin.weapon}
        </p>
        <p className="text-sm font-light text-gray-700 leading-tight">
          {skin.skinName}
        </p>
        <div className="mt-2">
          <span
            className="text-[0.6875rem] px-2 py-1 rounded text-white font-light"
            style={{ background: rarityColor }}
          >
            {skin.rarity}
          </span>
        </div>
      </div>

      {/* Similar section */}
      <div>
        <p className="text-xs font-light text-gray-400 mb-2 tracking-wide">
          Similar:
        </p>
        <div className="grid grid-cols-5 gap-1">
          {similar.map((s) => {
            const sc = skinToColor(s);
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                title={`${s.weapon} | ${s.skinName}`}
                className="rounded overflow-hidden hover:ring-1 hover:ring-gray-300 transition-all"
                style={{ background: `${sc}1a`, aspectRatio: "4/3" }}
              >
                <div className="relative w-full h-full">
                  <img
                    src={`/CS2Skins/${s.imageId}.png`}
                    alt={`${s.weapon} | ${s.skinName}`}
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable={false}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/*<div className="absolute inset-0 flex items-center justify-center">
                    <GunSmall color={sc} />
                  </div> */}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
