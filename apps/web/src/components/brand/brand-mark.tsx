type BrandMarkProps = {
  alt?: string;
  className?: string;
};

export function BrandMark({ alt = "", className = "" }: BrandMarkProps) {
  return (
    <img
      alt={alt}
      className={className}
      height={499}
      src={`${process.env.NEXT_PUBLIC_BASE_PATH}/brand/icon.svg`}
      width={500}
    />
  );
}
