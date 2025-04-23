import CollapsibleSection from "@/components/base/CollapsibleSection";
export default function StudyComponent() {
  return (
    <div className="w-full overflow-auto">
      <div className="min-w-[400px] max-w-[850px] rounded overflow-hidden border border-grey">
        <CollapsibleSection title="Title">
          <p>
            Characterization of Biofilm Formation, Growth, and Gene Expression
            on Different Materials and Environmental Conditions in Microgravity
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Description">
          <p>Test Title</p>
        </CollapsibleSection>
      </div>
    </div>
  );
}
