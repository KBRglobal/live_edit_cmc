import { NextRequest, NextResponse } from "next/server";
import type { ComponentState } from "@/types/liveEdit";

// Shared store reference (in production, use a database)
const layoutsStore: Map<string, any> = new Map();

// PUT /api/layouts/[pageSlug]/draft
export async function PUT(
  request: NextRequest,
  { params }: { params: { pageSlug: string } }
) {
  try {
    const { pageSlug } = params;
    const body = await request.json();
    const { components } = body as { components: ComponentState[] };

    // Get existing layout or create new one
    let layout = layoutsStore.get(pageSlug);

    if (!layout) {
      layout = {
        id: `layout-${Date.now()}`,
        pageSlug,
        pageType: "custom",
        components: [],
        publishedAt: null,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Update draft
    layout.draftComponents = components;
    layout.draftUpdatedAt = new Date().toISOString();
    layout.updatedAt = new Date().toISOString();

    layoutsStore.set(pageSlug, layout);

    return NextResponse.json({
      success: true,
      savedAt: layout.draftUpdatedAt,
    });
  } catch (error) {
    console.error("Failed to save draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}

// DELETE /api/layouts/[pageSlug]/draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: { pageSlug: string } }
) {
  try {
    const { pageSlug } = params;

    const layout = layoutsStore.get(pageSlug);
    if (layout) {
      layout.draftComponents = undefined;
      layout.draftUpdatedAt = undefined;
      layoutsStore.set(pageSlug, layout);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to discard draft:", error);
    return NextResponse.json(
      { error: "Failed to discard draft" },
      { status: 500 }
    );
  }
}
