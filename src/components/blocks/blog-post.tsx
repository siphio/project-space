"use client";

import { ArrowLeft, Calendar, User, Briefcase, Megaphone, Code, Building2, Share2 } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/data/blog";

interface BlogPostPageProps {
  post: BlogPost;
  className?: string;
}

const categoryConfig = {
  company: {
    label: "Company",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  hiring: {
    label: "Hiring",
    icon: Briefcase,
    color: "bg-green-500/10 text-green-700 border-green-500/20",
  },
  product: {
    label: "Product",
    icon: Code,
    color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  },
  announcement: {
    label: "Announcement",
    icon: Megaphone,
    color: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  },
  engineering: {
    label: "Engineering",
    icon: Code,
    color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  },
};

const CategoryBadge = ({ category }: { category: BlogPost["category"] }) => {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", config.color)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
};

const BlogPostPage = ({ post, className }: BlogPostPageProps) => {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <section className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <div className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Blog
          </Link>
          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="size-4" />
            Share
          </Button>
        </div>
      </div>

      <article className="container py-12">
        {/* Post Header */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="mb-6">
            <CategoryBadge category={post.category} />
          </div>

          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground pb-8 border-b">
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <User className="size-5 text-orange-500" />
              </div>
              <span className="font-medium text-foreground">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-orange-500" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/10 to-yellow-500/10 p-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto max-h-96 object-contain mx-auto"
              />
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            {post.content.split("\n\n").map((paragraph, index) => {
              // Handle headers
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              // Handle list items
              if (paragraph.startsWith("- ")) {
                const items = paragraph.split("\n");
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 my-4">
                    {items.map((item, i) => (
                      <li key={i} className="text-muted-foreground">
                        {item.replace("- ", "").split("**").map((part, j) =>
                          j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
                        )}
                      </li>
                    ))}
                  </ul>
                );
              }
              // Regular paragraphs with bold text support
              return (
                <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                  {paragraph.split("**").map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
                  )}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-3xl mx-auto mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to all posts
            </Link>
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="size-4" />
              Share this post
            </Button>
          </div>
        </div>
      </article>
    </section>
  );
};

export { BlogPostPage };
