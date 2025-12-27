import { notFound } from "next/navigation";
import { Metadata } from "next";

import { NoticeBoard } from "@/components/blocks/notice-board";
import { getAppBySlug, getAllApps } from "@/data/apps";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const apps = getAllApps();
  return apps.map((app) => ({
    slug: app.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    return {
      title: "App Not Found",
    };
  }

  return {
    title: `${app.name} - Notice Board | Siphio AI`,
    description: app.description,
  };
}

export default async function NoticeBoardPage({ params }: PageProps) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  return <NoticeBoard app={app} />;
}
