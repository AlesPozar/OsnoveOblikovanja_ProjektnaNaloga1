"use client";

interface Props {
  onContinue: () => void;
}

const LINKEDIN_URL = "https://www.linkedin.com/in/ale%C5%A1-po%C5%BEar-946854279/";
const DOMEN_LINKEDIN_URL = "https://www.linkedin.com/in/domen-kamplet-03603629a/";

export default function TitleScreen({ onContinue }: Props) {
  return (
    <div className="relative w-full h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-5 left-10 text-xs font-light text-gray-400 tracking-widest">
        by{" "}
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          Ale&#353;
        </a>{" "}
        and{" "}
        <a href={DOMEN_LINKEDIN_URL} target="_blank" rel="noreferrer">
          Domen
        </a>
      </div>

      <h1
        className="w-fit font-light italic text-center leading-tight select-none"
        style={{ fontSize: "clamp(2.8rem, 6.3vw, 5.8rem)" }}
        aria-label="CS2 Skins Theory - color"
      >
        <span
          className="inline-block pr-[0.08em] bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(90deg, #e8a020, #8dc83a)",
            WebkitTextFillColor: "transparent",
          }}
        >
          CS2
        </span>{" "}
        <span
          className="relative inline-block pr-[0.08em] bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(90deg, #8dc83a, #22b8a0)",
            WebkitTextFillColor: "transparent",
          }}
        >
          SKINS
          <span
            aria-hidden="true"
            className="absolute top-[calc(100%_-_1em)] left-[calc(100%_-_0.2em)] whitespace-nowrap font-light not-italic tracking-[0.35em] text-gray-400"
            style={{
              fontSize: "clamp(1rem, 1.65vw, 1.35rem)",
              WebkitTextFillColor: "#9ca3af",
            }}
          >
            /color
          </span>
        </span>{" "}
        <span
          className="inline-block pr-[0.15em] bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(90deg, #4060e8, #c020a0)",
            WebkitTextFillColor: "transparent",
          }}
        >
          THEORY
        </span>
      </h1>

      <button
        onClick={onContinue}
        className="absolute bottom-16 text-base font-light tracking-[0.2em] text-gray-400 hover:text-gray-800 transition-colors duration-300 pb-0.5 border-b border-transparent hover:border-gray-400"
      >
        continue
      </button>

      <div className="absolute bottom-0 right-10 w-30 h-30">
        <img
          src="CS2Stickers/f36ea9a5aef81d4440bff827d2d2d206.png"
          alt="CS2"
          className="w-full"
        />
      </div>
    </div>
  );
}
