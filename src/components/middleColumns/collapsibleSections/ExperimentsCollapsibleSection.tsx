// src/components/collapsibleSections/ExperimentsCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface ExperimentsCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function ExperimentsCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: ExperimentsCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="experiments"
      sectionId="experiments"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={false}
    >
      <EditableTextArea
        sectionId="experiments"
        value={value}
        onChange={onChange}
        placeholder="Enter experiments…"
        rows={5}
        maxHeight="350px"
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
