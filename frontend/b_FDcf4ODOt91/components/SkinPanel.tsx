"use client";
import { Star } from "lucide-react";
import { Skin, skinToColor, findSimilarSkins } from "@/lib/skinData";
import { GunLarge, GunSmall } from "./GunPlaceholder";

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
  const similar = findSimilarSkins(skin, allSkins, 12);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Star like button — above image, centered */}
      <div className="flex justify-center">
        <button
          onClick={() => onLike(skin.id)}
          className="transition-transform hover:scale-110"
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
      </div>

      {/* Main weapon image / placeholder */}
      <div
        className="w-full aspect-[16/9] rounded flex items-center justify-center overflow-hidden"
        style={{ background: `${color}18` }}
      >
        <GunLarge color={color} />
      </div>

      {/* Skin name + weapon */}
      <div className="text-left">
        <p className="text-[11px] font-light text-gray-400 tracking-wide">
          {skin.weapon}
        </p>
        <p className="text-sm font-light text-gray-700 leading-tight">
          {skin.skinName}
        </p>
      </div>

      {/* Similar section */}
      <div>
        <p className="text-xs font-light text-gray-400 mb-2 tracking-wide">
          Similar:
        </p>
        <div className="grid grid-cols-6 gap-1">
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
                <GunSmall color={sc} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
