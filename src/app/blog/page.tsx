import { Metadata } from "next";

import { BlogPage } from "@/components/blocks/blog-page";
import { getAllBlogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog | Siphio AI",
  description: "News and updates from Siphio AI - company news, product updates, hiring announcements, and engineering insights.",
};

export default function Blog() {
  const posts = getAllBlogPosts().slice(0, 6);
  return <BlogPage posts={posts} />;
}
