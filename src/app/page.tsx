"use client";

import {
  LiveEditProvider,
  DragDropProvider,
  LiveEditToggle,
  LiveEditToolbar,
  LiveEditSidebar,
  EditableWrapper,
  InlineTextEditor,
  ContentPickerDialog,
  MediaPickerDialog,
  PublishDialog,
  DiscardDialog,
  useLiveEditStore,
} from "@/components/live-edit";
import { cn } from "@/lib/utils";

// Demo user (in production, get from auth)
const demoUser = {
  id: "user-1",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin" as const,
};

// Demo components that would be rendered based on layout
function HeroComponent({
  componentId,
  title,
  subtitle,
  ctaText,
}: {
  componentId: string;
  title: string;
  subtitle: string;
  ctaText: string;
}) {
  return (
    <EditableWrapper componentId={componentId} componentType="hero">
      <div className="relative bg-gradient-to-br from-primary to-primary/80 text-white py-20 px-8 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <InlineTextEditor
            componentId={componentId}
            fieldName="title"
            value={title}
            as="h1"
            maxLength={100}
            className="text-4xl md:text-5xl font-bold mb-4"
          />
          <InlineTextEditor
            componentId={componentId}
            fieldName="subtitle"
            value={subtitle}
            as="p"
            maxLength={200}
            className="text-xl opacity-90 mb-8"
          />
          <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            {ctaText}
          </button>
        </div>
      </div>
    </EditableWrapper>
  );
}

function HeadingComponent({
  componentId,
  text,
  level,
}: {
  componentId: string;
  text: string;
  level: "h1" | "h2" | "h3" | "h4";
}) {
  return (
    <EditableWrapper componentId={componentId} componentType="heading">
      <InlineTextEditor
        componentId={componentId}
        fieldName="text"
        value={text}
        as={level}
        maxLength={150}
        className={cn(
          "font-bold",
          level === "h1" && "text-4xl",
          level === "h2" && "text-3xl",
          level === "h3" && "text-2xl",
          level === "h4" && "text-xl"
        )}
      />
    </EditableWrapper>
  );
}

function TextBlockComponent({
  componentId,
  content,
}: {
  componentId: string;
  content: string;
}) {
  return (
    <EditableWrapper componentId={componentId} componentType="textBlock">
      <InlineTextEditor
        componentId={componentId}
        fieldName="content"
        value={content}
        as="div"
        richText
        className="prose max-w-none"
      />
    </EditableWrapper>
  );
}

function ContentGridComponent({
  componentId,
  columns,
}: {
  componentId: string;
  columns: number;
}) {
  // Demo cards
  const demoCards = [
    { id: 1, title: "אטרקציה 1", image: "🏛️" },
    { id: 2, title: "אטרקציה 2", image: "🏖️" },
    { id: 3, title: "אטרקציה 3", image: "🏔️" },
  ];

  return (
    <EditableWrapper componentId={componentId} componentType="contentGrid">
      <div
        className={cn(
          "grid gap-6",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4"
        )}
      >
        {demoCards.map((card) => (
          <div
            key={card.id}
            className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-gray-100 flex items-center justify-center text-4xl">
              {card.image}
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                תיאור קצר של האטרקציה
              </p>
            </div>
          </div>
        ))}
      </div>
    </EditableWrapper>
  );
}

// Main page content
function PageContent() {
  const { isEditMode, currentLayout, componentOrder } = useLiveEditStore();

  // Render components based on layout
  const renderComponent = (componentId: string) => {
    const component = currentLayout[componentId];
    if (!component) return null;

    switch (component.type) {
      case "hero":
        return (
          <HeroComponent
            key={componentId}
            componentId={componentId}
            title={component.props.title}
            subtitle={component.props.subtitle}
            ctaText={component.props.ctaText}
          />
        );
      case "heading":
        return (
          <HeadingComponent
            key={componentId}
            componentId={componentId}
            text={component.props.text}
            level={component.props.level}
          />
        );
      case "textBlock":
        return (
          <TextBlockComponent
            key={componentId}
            componentId={componentId}
            content={component.props.content}
          />
        );
      case "contentGrid":
        return (
          <ContentGridComponent
            key={componentId}
            componentId={componentId}
            columns={component.props.columns}
          />
        );
      default:
        return (
          <EditableWrapper
            key={componentId}
            componentId={componentId}
            componentType={component.type}
          >
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Component: {component.type}</p>
            </div>
          </EditableWrapper>
        );
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-gray-50",
        isEditMode && "pt-14" // Add padding for toolbar
      )}
    >
      {/* Main Content */}
      <main className={cn("container mx-auto py-8 px-4", isEditMode && "pr-84")}>
        {/* Static content when not editing or when layout is empty */}
        {componentOrder.length === 0 ? (
          <div className="space-y-8">
            {/* Demo Hero */}
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-20 px-8 rounded-lg">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  ברוכים הבאים לאתר
                </h1>
                <p className="text-xl opacity-90 mb-8">
                  גלו את החוויות הטובות ביותר
                </p>
                <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  התחילו עכשיו
                </button>
              </div>
            </div>

            {/* Demo Content Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">יעדים פופולריים</h2>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="h-40 bg-gray-100 flex items-center justify-center text-4xl">
                      {["🏛️", "🏖️", "🏔️"][i - 1]}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">אטרקציה {i}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        תיאור קצר של האטרקציה
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Demo Text Block */}
            <section className="prose max-w-none">
              <p>
                גלו את היעדים הטובים ביותר עם המדריכים שלנו. אנחנו עוזרים לכם
                לתכנן את החופשה המושלמת.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-8">
            {componentOrder.map((componentId) => renderComponent(componentId))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <LiveEditProvider user={demoUser}>
      <DragDropProvider>
        {/* Toolbar */}
        <LiveEditToolbar />

        {/* Main Page Content */}
        <PageContent />

        {/* Sidebar */}
        <LiveEditSidebar />

        {/* Floating Edit Button */}
        <LiveEditToggle pageSlug="home" />

        {/* Dialogs */}
        <ContentPickerDialog />
        <MediaPickerDialog />
        <PublishDialog />
        <DiscardDialog />
      </DragDropProvider>
    </LiveEditProvider>
  );
}
