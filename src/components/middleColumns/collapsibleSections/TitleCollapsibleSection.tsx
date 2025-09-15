// src/components/collapsibleSections/TitleCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface TitleCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function TitleCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: TitleCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="title"
      sectionId="title"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={true}
    >
      <EditableTextArea
        sectionId="title"
        value={value}
        onChange={onChange}
        placeholder="Enter title…"
        rows={6}
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
