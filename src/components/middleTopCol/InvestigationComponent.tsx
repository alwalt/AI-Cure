import CollapsibleSection from "@/components/base/CollapsibleSection";

export default function InvestigationComponent() {
  return (
    <div className="w-full overflow-auto">
      <div className="min-w-[400px] max-w-[850px] rounded overflow-hidden border border-grey">
        <CollapsibleSection title="Description">
          <p>Super conduting magnents.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Title">
          <p>Test Title</p>
        </CollapsibleSection>
      </div>
    </div>
  );
}
