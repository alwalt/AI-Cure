// src/components/collapsibleSections/PublicationsCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface PublicationsCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function PublicationsCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: PublicationsCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="publications"
      sectionId="publications"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={false}
    >
      <EditableTextArea
        sectionId="publications"
        value={value}
        onChange={onChange}
        placeholder="Enter publications…"
        rows={4}
        maxHeight="350px"
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
