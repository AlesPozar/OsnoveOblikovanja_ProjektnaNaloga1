"use client";

interface Props {
  onContinue: () => void;
}

export default function TitleScreen({ onContinue }: Props) {
  return (
    <div className="relative w-full h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Authors — top left */}
      <div className="absolute top-5 left-6 text-[11px] font-light text-gray-400 tracking-widest">
        by Domen and Ale&#353;
      </div>

      {/* Main title — thin italic, each word a distinct hue from the rainbow */}
      <h1
        className="font-light italic text-center leading-tight select-none"
        style={{ fontSize: "clamp(2.6rem, 6vw, 5.5rem)", letterSpacing: "-0.01em" }}
        aria-label="CS2 Skins Theory — color"
      >
        {/* Each span is a different hue, matching the Figma: */}
        {/* CS2 → amber/orange */}
        <span style={{ color: "#e8a020" }}>CS2</span>{" "}
        {/* SKINS → lime green */}
        <span style={{ color: "#5cc83a" }}>SKINS</span>{" "}
        {/* THEORY → blue-purple */}
        <span style={{ color: "#4a6be0" }}>THEORY</span>
      </h1>

      {/* /color — small, centered below the title */}
      <p
        className="font-light tracking-[0.35em] text-gray-400 mt-2 select-none"
        style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.25rem)" }}
      >
        /color
      </p>

      {/* Continue — very bottom center */}
      <button
        onClick={onContinue}
        className="absolute bottom-16 text-sm font-light tracking-[0.2em] text-gray-400 hover:text-gray-800 transition-colors duration-300 pb-0.5 border-b border-transparent hover:border-gray-400"
      >
        continue
      </button>

      {/* CS2 sticker — bottom right corner */}
      <div className="absolute bottom-4 right-5 w-20 h-20">
        <img
          src="CS2Stickers/f36ea9a5aef81d4440bff827d2d2d206.png"
          alt="CS2"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
