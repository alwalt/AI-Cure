// src/components/collapsibleSections/VisualizationCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface VisualizationCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function VisualizationCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: VisualizationCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="visualization"
      sectionId="visualization"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={false}
    >
      <EditableTextArea
        sectionId="visualization"
        value={value}
        onChange={onChange}
        placeholder="Enter visualization information…"
        rows={4}
        maxHeight="350px"
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
