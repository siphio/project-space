import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// GET - Fetch all blog posts
export async function GET() {
  try {
    const dataPath = join(process.cwd(), "src/data/blog.ts");
    const fileContent = readFileSync(dataPath, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Blog posts retrieved",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST - Add a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, category, image, author, featured } = body;

    if (!title || !excerpt || !content || !category) {
      return NextResponse.json(
        { success: false, error: "Title, excerpt, content, and category are required" },
        { status: 400 }
      );
    }

    const validCategories = ["company", "hiring", "product", "announcement", "engineering"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Category must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newPost = {
      id: Date.now().toString(),
      slug,
      title,
      excerpt,
      content,
      category,
      image: image || "",
      author: {
        name: author || "Siphio Team",
      },
      publishedAt: new Date().toISOString().split("T")[0],
      featured: featured || false,
    };

    // Read the current blog.ts file
    const dataPath = join(process.cwd(), "src/data/blog.ts");
    let fileContent = readFileSync(dataPath, "utf-8");

    // Find the blogPosts array and add the new post at the beginning
    const insertPoint = fileContent.indexOf("export const blogPosts: BlogPost[] = [") + "export const blogPosts: BlogPost[] = [".length;

    const newPostString = `
  {
    id: "${newPost.id}",
    slug: "${newPost.slug}",
    title: "${newPost.title.replace(/"/g, '\\"')}",
    excerpt: "${newPost.excerpt.replace(/"/g, '\\"')}",
    content: \`${newPost.content.replace(/`/g, "\\`")}\`,
    category: "${newPost.category}",
    image: "${newPost.image}",
    author: {
      name: "${newPost.author.name}",
    },
    publishedAt: "${newPost.publishedAt}",
    featured: ${newPost.featured},
  },`;

    fileContent = fileContent.slice(0, insertPoint) + newPostString + fileContent.slice(insertPoint);

    writeFileSync(dataPath, fileContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Blog post added successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error adding blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add blog post" },
      { status: 500 }
    );
  }
}
