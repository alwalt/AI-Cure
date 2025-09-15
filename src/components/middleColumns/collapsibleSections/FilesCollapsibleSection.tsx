// src/components/collapsibleSections/FilesCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface FilesCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function FilesCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: FilesCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="files"
      sectionId="files"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={false}
    >
      <EditableTextArea
        sectionId="files"
        value={value}
        onChange={onChange}
        placeholder="Enter files information…"
        rows={4}
        maxHeight="300px"
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
