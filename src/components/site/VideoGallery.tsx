"use client";

import Image from "next/image";
import { useState } from "react";
import Reveal from "./Reveal";

export type GalleryVideo = { id: string; youtubeId: string; title: string };

/**
 * Videos de YouTube de una galería. Se muestra la miniatura y el reproductor solo se carga al pulsar,
 * así la página no descarga YouTube hasta que alguien quiere ver un video.
 */
export default function VideoGallery({ videos, playLabel }: { videos: GalleryVideo[]; playLabel: string }) {
  const [playing, setPlaying] = useState<string | null>(null);
  if (videos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
      {videos.map((v) => (
        <Reveal key={v.id}>
          <figure>
            <div className="relative aspect-video overflow-hidden bg-ink">
              {playing === v.id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
                  title={v.title || "Video"}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(v.id)}
                  aria-label={v.title ? `${playLabel}: ${v.title}` : playLabel}
                  className="group absolute inset-0"
                >
                  <Image
                    src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                  />
                  <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bg/90 text-ink transition-transform group-hover:scale-110">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            {v.title && <figcaption className="mt-3 display-serif text-[1.6rem] leading-tight">{v.title}</figcaption>}
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
