import { NextRequest, NextResponse } from "next/server";

// Shared store reference (in production, use a database)
const layoutsStore: Map<string, any> = new Map();

// POST /api/layouts/[pageSlug]/publish
export async function POST(
  request: NextRequest,
  { params }: { params: { pageSlug: string } }
) {
  try {
    const { pageSlug } = params;

    const layout = layoutsStore.get(pageSlug);

    if (!layout) {
      return NextResponse.json(
        { error: "Layout not found" },
        { status: 404 }
      );
    }

    // Publish draft to live
    if (layout.draftComponents) {
      layout.components = layout.draftComponents;
      layout.draftComponents = undefined;
      layout.draftUpdatedAt = undefined;
    }

    layout.publishedAt = new Date().toISOString();
    layout.version = (layout.version || 0) + 1;
    layout.updatedAt = new Date().toISOString();

    layoutsStore.set(pageSlug, layout);

    return NextResponse.json({
      success: true,
      publishedAt: layout.publishedAt,
      version: layout.version,
    });
  } catch (error) {
    console.error("Failed to publish:", error);
    return NextResponse.json(
      { error: "Failed to publish" },
      { status: 500 }
    );
  }
}
