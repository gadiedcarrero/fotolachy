import Image from "next/image";
import Reveal from "./Reveal";

export type GalleryPhoto = { id: string; url: string; alt: string; width: number; height: number };

type Props = {
  photos: GalleryPhoto[];
  columns?: 2 | 3;
};

/** Cuadrícula tipo masonry (usa CSS columns) para galerías en vertical. */
export default function GridGallery({ photos, columns = 3 }: Props) {
  if (photos.length === 0) {
    return <p className="text-center text-muted py-20">Aún no hay fotos en esta galería.</p>;
  }
  return (
    <div className={`${columns === 2 ? "md:columns-2" : "md:columns-3"} columns-1 gap-4 md:gap-6 *:mb-4 md:*:mb-6`}>
      {photos.map((p) => (
        <Reveal key={p.id}>
          <figure className="photo-frame mono break-inside-avoid" style={{ aspectRatio: `${p.width} / ${p.height}` }}>
            <Image
              src={p.url}
              alt={p.alt}
              width={p.width}
              height={p.height}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="h-full w-full object-cover"
            />
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
