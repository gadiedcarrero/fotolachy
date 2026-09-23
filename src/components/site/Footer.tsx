import Link from "next/link";

type Props = {
  siteName: string;
  email: string;
  instagramUrl: string;
  footerText: string;
  links: { label: string; href: string }[];
};

export default function Footer({ siteName, email, instagramUrl, footerText, links }: Props) {
  return (
    <footer className="border-t border-line px-6 md:px-16 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="font-sans text-[0.8rem] font-medium tracking-[0.35em] uppercase">{siteName}</p>
          <a href={`mailto:${email}`} className="mt-3 block font-serif italic text-xl hover:opacity-60 transition-opacity">
            {email}
          </a>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="eyebrow hover:opacity-60 transition-opacity">
              {l.label}
            </Link>
          ))}
          <a href={instagramUrl} target="_blank" rel="noreferrer" className="eyebrow hover:opacity-60 transition-opacity">
            Instagram
          </a>
        </nav>
      </div>
      <p className="mt-10 text-xs text-muted">
        {footerText} · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
