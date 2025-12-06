"use client";

import Image from "next/image";

interface PostImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export default function PostImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
}: PostImageProps) {
  // Check if it's a base64 data URI
  const isBase64 = src.startsWith("data:image/");

  if (isBase64) {
    // Use regular img tag for base64 images (Next.js Image doesn't support base64)
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  // Use Next.js Image for URLs
  if (fill) {
    return <Image src={src} alt={alt} fill className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}

