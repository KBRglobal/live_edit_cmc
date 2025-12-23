import type { EditableComponentConfig, ComponentCategory } from "@/types/liveEdit";

export const componentRegistry: Record<string, EditableComponentConfig> = {
  // ===== Layout Components =====
  hero: {
    type: "hero",
    displayName: "Hero Section",
    icon: "🎯",
    category: "layout",
    editableFields: [
      {
        name: "title",
        type: "text",
        label: "Title",
        required: true,
        maxLength: 100,
      },
      {
        name: "subtitle",
        type: "text",
        label: "Subtitle",
        maxLength: 200,
      },
      {
        name: "backgroundImage",
        type: "image",
        label: "Background Image",
      },
      {
        name: "ctaText",
        type: "text",
        label: "Button Text",
        maxLength: 50,
      },
      {
        name: "ctaLink",
        type: "link",
        label: "Button Link",
      },
      {
        name: "alignment",
        type: "select",
        label: "Text Alignment",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
    capabilities: {
      draggable: true,
      resizable: false,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      title: "Hero Title",
      subtitle: "Hero subtitle goes here",
      alignment: "center",
      ctaText: "Learn More",
      ctaLink: "/",
    },
  },

  // ===== Content Components =====
  contentCard: {
    type: "contentCard",
    displayName: "Content Card",
    icon: "📄",
    category: "content",
    editableFields: [
      {
        name: "contentRef",
        type: "content",
        label: "Content",
        required: true,
      },
      {
        name: "showImage",
        type: "boolean",
        label: "Show Image",
      },
      {
        name: "showDescription",
        type: "boolean",
        label: "Show Description",
      },
    ],
    capabilities: {
      draggable: true,
      resizable: true,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      showImage: true,
      showDescription: true,
    },
  },

  contentGrid: {
    type: "contentGrid",
    displayName: "Content Grid",
    icon: "📊",
    category: "content",
    editableFields: [
      {
        name: "contentRefs",
        type: "content",
        label: "Content Items",
      },
      {
        name: "columns",
        type: "select",
        label: "Columns",
        options: [
          { label: "2 Columns", value: 2 },
          { label: "3 Columns", value: 3 },
          { label: "4 Columns", value: 4 },
        ],
      },
      {
        name: "contentType",
        type: "select",
        label: "Content Type Filter",
        options: [
          { label: "All", value: "all" },
          { label: "Attractions", value: "attraction" },
          { label: "Hotels", value: "hotel" },
          { label: "Articles", value: "article" },
        ],
      },
    ],
    capabilities: {
      draggable: true,
      resizable: false,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      columns: 3,
      contentType: "all",
      contentRefs: [],
    },
  },

  // ===== Text Components =====
  textBlock: {
    type: "textBlock",
    displayName: "Text Block",
    icon: "📝",
    category: "content",
    editableFields: [
      {
        name: "content",
        type: "richtext",
        label: "Content",
        required: true,
      },
    ],
    capabilities: {
      draggable: true,
      resizable: false,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      content: "<p>Enter your text here...</p>",
    },
  },

  heading: {
    type: "heading",
    displayName: "Heading",
    icon: "🔤",
    category: "content",
    editableFields: [
      {
        name: "text",
        type: "text",
        label: "Heading Text",
        required: true,
        maxLength: 150,
      },
      {
        name: "level",
        type: "select",
        label: "Heading Level",
        options: [
          { label: "H1", value: "h1" },
          { label: "H2", value: "h2" },
          { label: "H3", value: "h3" },
          { label: "H4", value: "h4" },
        ],
      },
    ],
    capabilities: {
      draggable: true,
      resizable: false,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      text: "New Heading",
      level: "h2",
    },
  },

  // ===== Media Components =====
  imageBlock: {
    type: "imageBlock",
    displayName: "Image",
    icon: "🖼️",
    category: "media",
    editableFields: [
      {
        name: "src",
        type: "image",
        label: "Image",
        required: true,
      },
      {
        name: "alt",
        type: "text",
        label: "Alt Text",
        required: true,
        maxLength: 200,
      },
      {
        name: "caption",
        type: "text",
        label: "Caption",
        maxLength: 300,
      },
    ],
    capabilities: {
      draggable: true,
      resizable: true,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      alt: "",
      caption: "",
    },
  },

  gallery: {
    type: "gallery",
    displayName: "Image Gallery",
    icon: "🎨",
    category: "media",
    editableFields: [
      {
        name: "images",
        type: "image",
        label: "Images",
      },
      {
        name: "layout",
        type: "select",
        label: "Layout",
        options: [
          { label: "Grid", value: "grid" },
          { label: "Masonry", value: "masonry" },
          { label: "Carousel", value: "carousel" },
        ],
      },
    ],
    capabilities: {
      draggable: true,
      resizable: false,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      images: [],
      layout: "grid",
    },
  },

  // ===== Interactive Components =====
  ctaButton: {
    type: "ctaButton",
    displayName: "CTA Button",
    icon: "🔘",
    category: "interactive",
    editableFields: [
      {
        name: "text",
        type: "text",
        label: "Button Text",
        required: true,
        maxLength: 50,
      },
      {
        name: "link",
        type: "link",
        label: "Link",
        required: true,
      },
      {
        name: "variant",
        type: "select",
        label: "Style",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" },
        ],
      },
      {
        name: "size",
        type: "select",
        label: "Size",
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
    ],
    capabilities: {
      draggable: true,
      resizable: false,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      text: "Click Me",
      link: "/",
      variant: "primary",
      size: "md",
    },
  },

  faqAccordion: {
    type: "faqAccordion",
    displayName: "FAQ Accordion",
    icon: "❓",
    category: "interactive",
    editableFields: [
      {
        name: "items",
        type: "content",
        label: "FAQ Items",
      },
    ],
    capabilities: {
      draggable: true,
      resizable: false,
      deletable: true,
      duplicatable: true,
      hasChildren: true,
    },
    defaultProps: {
      items: [],
    },
  },

  spacer: {
    type: "spacer",
    displayName: "Spacer",
    icon: "↕️",
    category: "layout",
    editableFields: [
      {
        name: "height",
        type: "select",
        label: "Height",
        options: [
          { label: "Small (16px)", value: "16" },
          { label: "Medium (32px)", value: "32" },
          { label: "Large (64px)", value: "64" },
          { label: "Extra Large (96px)", value: "96" },
        ],
      },
    ],
    capabilities: {
      draggable: true,
      resizable: true,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      height: "32",
    },
  },

  divider: {
    type: "divider",
    displayName: "Divider",
    icon: "➖",
    category: "layout",
    editableFields: [
      {
        name: "style",
        type: "select",
        label: "Style",
        options: [
          { label: "Solid", value: "solid" },
          { label: "Dashed", value: "dashed" },
          { label: "Dotted", value: "dotted" },
        ],
      },
    ],
    capabilities: {
      draggable: true,
      resizable: false,
      deletable: true,
      duplicatable: true,
      hasChildren: false,
    },
    defaultProps: {
      style: "solid",
    },
  },
};

// Helper functions
export function getComponentConfig(
  type: string
): EditableComponentConfig | undefined {
  return componentRegistry[type];
}

export function getComponentsByCategory(
  category: ComponentCategory
): EditableComponentConfig[] {
  return Object.values(componentRegistry).filter(
    (c) => c.category === category
  );
}

export function getAllComponents(): EditableComponentConfig[] {
  return Object.values(componentRegistry);
}

export function getComponentCategories(): ComponentCategory[] {
  return ["layout", "content", "media", "interactive"];
}

export function getCategoryLabel(category: ComponentCategory): string {
  const labels: Record<ComponentCategory, string> = {
    layout: "Layout",
    content: "Content",
    media: "Media",
    interactive: "Interactive",
  };
  return labels[category];
}

export function getCategoryLabelHebrew(category: ComponentCategory): string {
  const labels: Record<ComponentCategory, string> = {
    layout: "פריסה",
    content: "תוכן",
    media: "מדיה",
    interactive: "אינטראקטיבי",
  };
  return labels[category];
}
