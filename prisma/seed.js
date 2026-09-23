/* eslint-disable @typescript-eslint/no-require-imports */
// Datos de ejemplo con imágenes placeholder (picsum.photos en blanco y negro).
// Es idempotente: se puede ejecutar varias veces sin duplicar nada.
// Ejecutar: npm run db:seed
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const pic = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}?grayscale`;

/** Secciones de primer nivel (aparecen en el menú). */
const sections = [
  {
    slug: "bodas-reales",
    title: "Bodas reales",
    subtitle: "Historias completas",
    description: "Cada boda es una historia completa. Elige una y recórrela de principio a fin.",
    layout: "stories",
    count: 0,
    // Historias: cada una es una sub-galería con su propia página
    children: [
      { slug: "villa-pizzo-lago-de-como", title: "Sofía & Andrés", subtitle: "Villa Pizzo, Lago de Como", count: 8 },
      { slug: "st-moritz", title: "Laura & Tomás", subtitle: "St. Moritz, Suiza", count: 8 },
      { slug: "villa-balbiano", title: "Camila & Nicolás", subtitle: "Villa Balbiano, Italia", count: 8 },
      { slug: "cartagena", title: "Valentina & Martín", subtitle: "Cartagena, Colombia", count: 8 },
      { slug: "san-miguel-de-allende", title: "Isabela & Julián", subtitle: "San Miguel de Allende, México", count: 8 },
    ],
  },
  {
    slug: "portafolio",
    title: "Portafolio",
    subtitle: "Selección editorial",
    description: "Nuestras imágenes favoritas. Luz natural, gesto y silencio.",
    layout: "vertical",
    count: 9,
  },
  {
    slug: "editorial",
    title: "Editorial",
    subtitle: "Moda y revistas",
    description: "Trabajos editoriales publicados en revistas de moda y bodas.",
    layout: "card",
    count: 9,
  },
  {
    slug: "destinos",
    title: "Destinos",
    subtitle: "Bodas alrededor del mundo",
    description: "Italia, Suiza, Colombia, México… viajamos a donde esté tu historia.",
    layout: "card",
    count: 9,
  },
];

function photosFor(slug, title, count, sectionId) {
  const photos = [];
  for (let j = 0; j < count; j++) {
    const portrait = j % 3 !== 1;
    const w = portrait ? 1200 : 1800;
    const h = portrait ? 1600 : 1200;
    photos.push({ url: pic(`${slug}-${j}`, w, h), alt: `${title} ${j + 1}`, width: w, height: h, order: j, sectionId });
  }
  return photos;
}

async function upsertSection(s, order, parentId = null) {
  const data = {
    title: s.title,
    subtitle: s.subtitle,
    description: s.description ?? null,
    layout: s.layout ?? "card",
    order,
    parentId,
    coverUrl: pic(`${s.slug}-cover`, 900, 1200),
    showInMenu: parentId ? false : true,
    showInHome: parentId ? false : true,
  };
  const section = await prisma.section.upsert({
    where: { slug: s.slug },
    update: { layout: data.layout, parentId, order, subtitle: data.subtitle, description: data.description },
    create: { slug: s.slug, ...data },
  });
  const existing = await prisma.photo.count({ where: { sectionId: section.id } });
  if (existing === 0 && s.count > 0) {
    await prisma.photo.createMany({ data: photosFor(s.slug, s.title, s.count, section.id) });
  }
  return section;
}

async function main() {
  // En despliegues se ejecuta en cada build: solo carga los ejemplos si la base está vacía
  // (o si se pasa --force), para no recrear secciones que el fotógrafo haya borrado.
  const force = process.argv.includes("--force");
  const existing = await prisma.section.count();
  if (existing > 0 && !force) {
    console.log(`La base ya tiene ${existing} secciones; no se cargan datos de ejemplo (usa --force para forzar).`);
    return;
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "Foto Lachy",
      heroPhotoUrl: pic("hero-bride", 1400, 1800),
      aboutPhotoUrl: pic("about-couple", 1200, 1600),
    },
  });

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const parent = await upsertSection(s, i);
    if (s.children) {
      for (let j = 0; j < s.children.length; j++) {
        await upsertSection(s.children[j], j, parent.id);
      }
    }
  }

  // Compatibilidad: valores antiguos de layout
  await prisma.section.updateMany({ where: { layout: "horizontal" }, data: { layout: "stories" } });
  await prisma.section.updateMany({ where: { layout: "grid" }, data: { layout: "card" } });

  console.log("Datos de ejemplo cargados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
