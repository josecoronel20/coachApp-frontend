import { ImpruVLogo } from "./ImpruVLogo";

const sizeMap = {
  sm: { logo: 30, text: 20, gapH: 10, gapV: 10 },
  md: { logo: 44, text: 30, gapH: 12, gapV: 14 },
  lg: { logo: 70, text: 46, gapH: 16, gapV: 18 },
};

interface ImpruVWordmarkProps {
  variant?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

export function ImpruVWordmark({
  variant = "horizontal",
  size = "md",
  color = "#7C3AED",
  className,
}: ImpruVWordmarkProps) {
  const { logo, text, gapH, gapV } = sizeMap[size];

  const wordmark = (
    <span
      style={{
        fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: text,
        letterSpacing: 0,
        color,
        lineHeight: 1,
      }}
    >
      impruv
    </span>
  );

  if (variant === "vertical") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: gapV,
        }}
      >
        <ImpruVLogo size={logo} color={color} />
        {wordmark}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: gapH,
      }}
    >
      <ImpruVLogo size={logo} color={color} />
      {wordmark}
    </div>
  );
}

export default ImpruVWordmark;
