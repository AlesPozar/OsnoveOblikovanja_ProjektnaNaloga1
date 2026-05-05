"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { Skin, skinToColor, RARITY_COLORS } from "@/lib/skinData";
import { GunSmall } from "./GunPlaceholder";

interface Props {
  likedIds: Set<string>;
  allSkins: Skin[][];
  onUnlike: (id: string) => void;
  currentSection: number;
  totalSections: number;
  onNavClick: (i: number) => void;
}

export default function LikedSection({
  likedIds,
  allSkins,
  onUnlike,
  currentSection,
  totalSections,
  onNavClick,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const likedMap = new Map<string, Skin>();
  for (const dataset of allSkins) {
    for (const skin of dataset) {
      if (likedIds.has(skin.id) && !likedMap.has(skin.id)) {
        likedMap.set(skin.id, skin);
      }
    }
  }
  const liked = Array.from(likedMap.values());

  return (
    <div className="relative min-h-screen bg-white px-10 pt-16 pb-20 overflow-hidden">
      {/* Title */}
      <h2
        className="font-light italic text-center mb-2 leading-tight"
        style={{
          fontSize: "clamp(2rem, 4vw, 3.5rem)",
          background: "linear-gradient(90deg, #e8a020 0%, #5cc83a 35%, #4a6be0 70%, #9b4de0 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        LIKED SKINS
      </h2>
      <p className="text-center text-sm font-light text-gray-400 mb-10 tracking-wide">
        Your personal collection
      </p>

      {liked.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Star size={36} strokeWidth={1} className="text-gray-200" />
          <p className="text-sm font-light text-gray-400 text-center max-w-xs">
            No liked skins yet. Click the star icon on any skin to save it here.
          </p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-max">
            {liked.map((skin) => {
              const color = skinToColor(skin);
              const rarityColor = RARITY_COLORS[skin.rarity] || "#aaa";
              const isExpanded = expandedId === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`group relative rounded border border-gray-100 hover:border-gray-300 p-3 transition-all bg-white hover:shadow-sm flex flex-col ${
                    isExpanded ? "col-span-2 row-span-2" : ""
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : skin.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlike(skin.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-40"
                    aria-label="Unlike"
                  >
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  </button>

                  <div
                    className="w-full h-14 rounded flex items-center justify-center mb-2 overflow-hidden"
                    style={{ background: `${color}18` }}
                  >
                    <img
                      src={`/CS2Skins/${skin.imageId}.png`}
                      alt={`${skin.weapon} | ${skin.skinName}`}
                      className="absolute inset-0 w-full h-full object-contain"
                      draggable={false}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className={`${
                    isExpanded ? "opacity-100 absolute bottom-2 left-2 right-2" : "opacity-0"
                  }`}>
                    <p className="text-xs font-light text-gray-500 leading-tight truncate w-full">
                      {skin.weapon}
                    </p>
                    <p className="text-xl font-light text-gray-700 leading-tight truncate w-full">
                      {skin.skinName}
                    </p>
                    <span
                      className="text-xs mt-1.5 px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: rarityColor }}
                    >
                      {skin.rarity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Authors */}
      <div className="absolute bottom-5 left-6 text-[11px] font-light text-gray-400 tracking-widest">
        by Ale&#353; and Domen
      </div>

      {/* CS2 sticker */}
      <div className="absolute bottom-4 right-16 w-20 h-20">
        <img
          src="CS2Stickers/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJai0ki7VeTHjNqoO26H9ml29Zfn_1XiDgnwk5fy_B1T4P6hJqJvePPDXj_Jkr51seI4Sn_qwR9-tjiHyN2ocX3E.png"
          alt="CS2"
          className="w-full"
        />
      </div>

      {/* Nav dots */}
      <nav
        className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40"
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
                  : "hover:w-4 hover:h-4 w-2.5 h-2.5 border-gray-300 hover:border-gray-500"
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  );
}
