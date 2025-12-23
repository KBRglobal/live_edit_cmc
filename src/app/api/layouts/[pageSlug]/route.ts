import { NextRequest, NextResponse } from "next/server";
import type { PageLayout, ComponentState } from "@/types/liveEdit";

// In-memory storage for demo (replace with database in production)
const layoutsStore: Map<string, PageLayout> = new Map();

// Initialize with demo data
const demoComponents: ComponentState[] = [
  {
    id: "hero-1",
    type: "hero",
    order: 0,
    parentId: null,
    props: {
      title: "ברוכים הבאים לאתר",
      subtitle: "גלו את החוויות הטובות ביותר",
      alignment: "center",
      ctaText: "התחילו עכשיו",
      ctaLink: "/explore",
    },
  },
  {
    id: "heading-1",
    type: "heading",
    order: 1,
    parentId: null,
    props: {
      text: "יעדים פופולריים",
      level: "h2",
    },
  },
  {
    id: "grid-1",
    type: "contentGrid",
    order: 2,
    parentId: null,
    props: {
      columns: 3,
      contentType: "attraction",
      contentRefs: [],
    },
  },
  {
    id: "text-1",
    type: "textBlock",
    order: 3,
    parentId: null,
    props: {
      content:
        "<p>גלו את היעדים הטובים ביותר עם המדריכים שלנו. אנחנו עוזרים לכם לתכנן את החופשה המושלמת.</p>",
    },
  },
];

// Initialize demo layout
layoutsStore.set("home", {
  id: "layout-1",
  pageSlug: "home",
  pageType: "home",
  components: demoComponents,
  draftComponents: undefined,
  publishedAt: new Date().toISOString(),
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// GET /api/layouts/[pageSlug]
export async function GET(
  request: NextRequest,
  { params }: { params: { pageSlug: string } }
) {
  try {
    const { pageSlug } = params;

    let layout = layoutsStore.get(pageSlug);

    // If layout doesn't exist, create a default one
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
      layoutsStore.set(pageSlug, layout);
    }

    return NextResponse.json(layout);
  } catch (error) {
    console.error("Failed to get layout:", error);
    return NextResponse.json(
      { error: "Failed to get layout" },
      { status: 500 }
    );
  }
}
