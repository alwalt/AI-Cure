// src/components/collapsibleSections/SamplesCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface SamplesCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function SamplesCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: SamplesCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="samples"
      sectionId="samples"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={false}
    >
      <EditableTextArea
        sectionId="samples"
        value={value}
        onChange={onChange}
        placeholder="Enter samples…"
        rows={4}
        maxHeight="300px"
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
