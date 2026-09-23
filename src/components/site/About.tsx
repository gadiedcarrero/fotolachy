import Image from "next/image";
import Reveal from "./Reveal";

type Props = {
  title: string;
  text: string;
  photoUrl: string | null;
  quote: string;
  pressText: string;
};

export default function About({ title, text, photoUrl, quote, pressText }: Props) {
  return (
    <section id="nosotros" className="px-6 md:px-16 py-24 md:py-32 border-t border-line">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
        <Reveal className="md:col-span-5">
          <div className="photo-frame mono aspect-[3/4]">
            {photoUrl && (
              <Image src={photoUrl} alt={title} width={900} height={1200} sizes="(max-width: 768px) 100vw, 40vw" className="h-full w-full object-cover" />
            )}
          </div>
        </Reveal>
        <div className="md:col-span-7 md:pl-8">
          <Reveal>
            <p className="eyebrow text-muted">{title}</p>
            <blockquote className="display-serif mt-4 text-[clamp(2rem,4vw,3.6rem)] leading-[1.05]">“{quote}”</blockquote>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl text-[1.02rem] leading-relaxed text-ink/80 whitespace-pre-line">{text}</p>
            <p className="eyebrow mt-10 text-muted">{pressText}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
