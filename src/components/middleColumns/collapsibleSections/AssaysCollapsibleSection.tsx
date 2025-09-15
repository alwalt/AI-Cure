// src/components/collapsibleSections/AssaysCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface AssaysCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function AssaysCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: AssaysCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="assays"
      sectionId="assays"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={false}
    >
      <EditableTextArea
        sectionId="assays"
        value={value}
        onChange={onChange}
        placeholder="Enter assays…"
        rows={4}
        maxHeight="300px"
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
