type BrandLogoProps = {
  alt?: string;
  className?: string;
};

export function BrandLogo({ alt = "", className = "" }: BrandLogoProps) {
  return (
    <img
      alt={alt}
      className={className}
      height={136}
      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/brand/logo.svg`}
      width={450}
    />
  );
}
