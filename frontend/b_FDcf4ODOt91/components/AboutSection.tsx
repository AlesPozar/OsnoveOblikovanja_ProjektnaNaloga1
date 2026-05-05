"use client";

interface Props {
  currentSection: number;
  totalSections: number;
  onNavClick: (i: number) => void;
}

export default function AboutSection({ currentSection, totalSections, onNavClick }: Props) {
  return (
    <div className="relative w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* Center title */}
      <div className="flex-1 flex flex-col items-center justify-center px-16 pb-8">
        <h2
          className="font-light italic text-center mb-16 leading-tight"
          style={{
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            background: "linear-gradient(90deg, #5cc83a 0%, #4a6be0 50%, #9b4de0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ABOUT THIS PROJECT
        </h2>

        {/* Explanation block — left-aligned like Figma */}
        <div className="max-w-sm w-full self-start ml-[8%]">
          <h3
            className="font-light italic tracking-widest text-gray-400 mb-3 uppercase"
            style={{ fontSize: "0.8rem" }}
          >
            Explanation
          </h3>
          <p className="text-sm font-light leading-relaxed text-gray-500">
            This project was build as a visual tool for Counter Strike 2 player, to visually
            build their in game loadouts based on color preferences. Also it is used
            to highlight any hidden links between available skins in the cs2 market.
            Note that gloves and some skins are not included, but majority of them
            are still present.
          </p>
        </div>
      </div>

      {/* Authors — bottom left */}
      <div className="absolute bottom-5 left-6 text-[11px] font-light text-gray-400 tracking-widest">
        by Domen and Ale&#353;
      </div>

      {/* CS2 sticker — bottom right */}
      <div className="absolute bottom-4 right-16">
        <img
          src="CS2Stickers/256fx256f.png"
          alt="CS2"
          className="w-20 h-20 rounded-full"
        />
      </div>

      {/* Nav dots — right side */}
      <nav
        className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40"
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
                  : "w-2.5 h-2.5 border-gray-300 hover:border-gray-500"
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  );
}
