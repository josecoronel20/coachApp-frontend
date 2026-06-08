import Image from "next/image";

interface ImpruVLogoProps {
  size?: number;
  color?: string;
  className?: string;
  alt?: string;
}

export function ImpruVLogo({
  size = 40,
  className,
  alt = "Impruv",
}: ImpruVLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  );
}

export default ImpruVLogo;
