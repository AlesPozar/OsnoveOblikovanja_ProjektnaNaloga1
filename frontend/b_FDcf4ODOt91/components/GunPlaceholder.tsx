// Shared gun silhouette placeholder components

export function GunLarge({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 110" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <rect x="10" y="48" width="110" height="14" rx="4" fill={color} opacity={0.85} />
      <rect x="110" y="38" width="70" height="34" rx="6" fill={color} opacity={0.85} />
      <rect x="130" y="72" width="22" height="30" rx="4" fill={color} opacity={0.75} />
      <rect x="148" y="34" width="8" height="8" rx="1.5" fill={color} opacity={0.6} />
      <rect x="6" y="50" width="8" height="10" rx="2" fill={color} opacity={0.7} />
      <rect x="178" y="40" width="10" height="10" rx="2" fill={color} opacity={0.6} />
    </svg>
  );
}

export function GunSmall({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 55" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <rect x="5" y="22" width="55" height="10" rx="3" fill={color} opacity={0.85} />
      <rect x="55" y="18" width="35" height="18" rx="4" fill={color} opacity={0.85} />
      <rect x="65" y="36" width="12" height="15" rx="2.5" fill={color} opacity={0.75} />
      <rect x="3" y="23.5" width="5" height="7" rx="1.5" fill={color} opacity={0.7} />
    </svg>
  );
}
