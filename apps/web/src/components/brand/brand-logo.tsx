type BrandLogoProps = {
  alt?: string;
  className?: string;
};

export function BrandLogo({
  alt = "",
  className = ""
}: BrandLogoProps) {
  return (
    <img
      alt={alt}
      className={className}
      height={136}
      src="/brand/logo.svg"
      width={450}
    />
  );
}
