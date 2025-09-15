// src/components/collapsibleSections/DescriptionCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface DescriptionCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function DescriptionCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: DescriptionCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="description"
      sectionId="description"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={true}
    >
      <EditableTextArea
        sectionId="description"
        value={value}
        onChange={onChange}
        placeholder="Enter description…"
        rows={6}
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
