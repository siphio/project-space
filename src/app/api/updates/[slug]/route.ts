import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Fetch updates for an app
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const dataPath = join(process.cwd(), "src/data/apps.ts");
    const fileContent = readFileSync(dataPath, "utf-8");

    // Parse the apps data (simple regex extraction for now)
    const appsMatch = fileContent.match(/export const apps[^}]+}[^}]+}/gs);

    return NextResponse.json({
      success: true,
      message: `Updates for ${slug}`,
      slug,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

// POST - Add a new update for an app
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const newUpdate = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      title,
      description: description || "",
    };

    // Read the current apps.ts file
    const dataPath = join(process.cwd(), "src/data/apps.ts");
    let fileContent = readFileSync(dataPath, "utf-8");

    // Find the updates array for the specific app and add the new update at the beginning
    const appUpdatesRegex = new RegExp(
      `("${slug}":\\s*\\{[^}]*updates:\\s*\\[)`,
      "s"
    );

    if (appUpdatesRegex.test(fileContent)) {
      fileContent = fileContent.replace(
        appUpdatesRegex,
        `$1\n      {\n        id: "${newUpdate.id}",\n        date: "${newUpdate.date}",\n        title: "${newUpdate.title}",\n        description: "${newUpdate.description}"\n      },`
      );

      writeFileSync(dataPath, fileContent, "utf-8");

      return NextResponse.json({
        success: true,
        message: `Update added to ${slug}`,
        update: newUpdate,
      });
    } else {
      return NextResponse.json(
        { success: false, error: `App "${slug}" not found` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error adding update:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add update" },
      { status: 500 }
    );
  }
}
