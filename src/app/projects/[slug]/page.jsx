import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROJECT1_ITEMS, projectCategory } from '@/shared/constants/project1-images';
import { getPublicImageSize } from '@/lib/image-size';
import { OPEN_GRAPH_BASE, SITE_NAME, SITE_URL, absoluteUrl, toJsonLd } from '@/lib/seo';

function findProject(slug) {
  return PROJECT1_ITEMS.find((project) => project.slug === slug);
}

function projectImages(project) {
  return project.subImages?.length ? project.subImages : [project.image];
}

// "MUSIC VIDEO / 2026" 형태의 subtitle에서 분야와 연도를 분리한다.
function splitSubtitle(subtitle) {
  const [category, year] = String(subtitle || '').split('/').map((part) => part.trim());
  return { category, year };
}

// 빌드 때 프로젝트 수만큼 정적 페이지를 만든다. 목록에 없는 슬러그는
// 렌더링조차 하지 않고 곧장 404 — 오타 주소가 200으로 열리면 검색엔진이 수집한다.
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECT1_ITEMS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return { title: 'Projects' };

  const url = `${SITE_URL}/projects/${project.slug}`;

  return {
    title: { absolute: `${project.title} · CAGE3000` },
    description: project.description_ko,
    alternates: { canonical: url },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      title: `${project.title} · CAGE3000`,
      description: project.description_ko,
      url,
    },
  };
}

function projectJsonLd(project) {
  const url = `${SITE_URL}/projects/${project.slug}`;
  const { year } = splitSubtitle(project.subtitle);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE_URL}/projects` },
          { '@type': 'ListItem', position: 3, name: project.title, item: url },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: project.title,
        description: project.description_ko,
        url,
        image: projectImages(project).map(absoluteUrl),
        creator: { '@id': `${SITE_URL}/#organization` },
        ...(year ? { dateCreated: year } : {}),
      },
    ],
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();
  const category = projectCategory(project);

  // 원본 크기를 빌드 때 읽어 next/image에 넘긴다 — 비율 왜곡도, 로딩 중 밀림도 없다.
  const images = await Promise.all(
    projectImages(project).map(async (src) => ({ src, ...(await getPublicImageSize(src)) }))
  );

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(projectJsonLd(project)) }}
      />

      <div className="max-w-screen-lg mx-auto px-6 md:px-12">
        {/* 라인·박스 없이 텍스트만 — 사진이 주인공이고 글은 작게 물러선다. */}
        <div className="max-w-xl space-y-5">
          <h1 className="text-xs md:text-sm tracking-wide">{project.title}</h1>
          {category && (
            <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-zinc-400">{category.label}</p>
          )}

          {project.credits?.length > 0 && (
            <div className="space-y-1">
              {project.credits.map((credit) => (
                <p key={`${credit.role}-${credit.name}`} className="text-[10px] md:text-xs text-zinc-400">
                  <span className="text-zinc-600">{credit.role}</span> — {credit.name}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="mt-16 md:mt-24 space-y-12 md:space-y-20">
          {images.map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt={`${project.title} — CAGE3000 ${index + 1}`}
              width={image.width}
              height={image.height}
              sizes="(max-width: 768px) 100vw, 900px"
              priority={index === 0}
              className="w-full h-auto"
            />
          ))}
        </div>

        <div className="mt-20 md:mt-28 flex flex-wrap gap-x-8 gap-y-3">
          <Link href="/projects" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">
            ← All Projects
          </Link>
          <Link href="/shop" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">
            Shop →
          </Link>
        </div>
      </div>
    </div>
  );
}
