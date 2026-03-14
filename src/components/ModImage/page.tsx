'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

const FALLBACK_ICON = 'https://cdn.modrinth.com/assets/unknown_server.png';

interface ModImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string | null | undefined;
  alt?: string;
}

export default function ModImage({ src, alt = 'icon', ...props }: ModImageProps) {
  const [error, setError] = useState(false);
  const imageSrc = error || !src ? FALLBACK_ICON : src;

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={() => {
        if (!error) setError(true);
      }}
      unoptimized // 任意の外部ドメインからの画像を許可＆Vercel等の画像最適化制限を回避
    />
  );
}
