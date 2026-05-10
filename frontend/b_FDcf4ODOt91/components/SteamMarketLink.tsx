"use client";

import { Skin } from "@/lib/skinData";

interface Props {
  skin: Skin;
  className?: string;
}

function steamMarketUrl(skin: Skin) {
  const marketName = `${skin.weapon} | ${skin.skinName} (Factory New)`;
  return `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketName)}`;
}

function SteamIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-9.93 8.8l5.36 2.22a2.8 2.8 0 0 1 1.58-.49l2.4-3.48v-.05a3.74 3.74 0 1 1 3.74 3.74h-.09l-3.42 2.45a2.83 2.83 0 1 1-5.3 1.41L2 15.27A10 10 0 1 0 12 2Zm-3.52 16.9a1.5 1.5 0 0 0 .06-2.99l-1.1-.46a1.5 1.5 0 1 0 1.04 3.45Zm6.67-7.4a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0-.63a1.88 1.88 0 1 1 0-3.75 1.88 1.88 0 0 1 0 3.75Z" />
    </svg>
  );
}

export default function SteamMarketLink({ skin, className = "" }: Props) {
  return (
    <a
      href={steamMarketUrl(skin)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 shadow-sm transition-colors hover:border-gray-400 hover:text-gray-900 ${className}`}
      title={`${skin.weapon} | ${skin.skinName} (Factory New) on Steam Market`}
      aria-label={`${skin.weapon} | ${skin.skinName} Factory New on Steam Market`}
      onClick={(e) => e.stopPropagation()}
    >
      <SteamIcon />
    </a>
  );
}
