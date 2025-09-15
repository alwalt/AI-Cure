// src/components/collapsibleSections/VersionHistoryCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface VersionHistoryCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function VersionHistoryCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: VersionHistoryCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="version history"
      sectionId="version history"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={false}
    >
      <EditableTextArea
        sectionId="version history"
        value={value}
        onChange={onChange}
        placeholder="Enter version history…"
        rows={4}
        maxHeight="350px"
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
