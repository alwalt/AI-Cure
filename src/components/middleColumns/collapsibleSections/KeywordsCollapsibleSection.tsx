// src/components/collapsibleSections/KeywordsCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface KeywordsCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function KeywordsCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: KeywordsCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="keywords"
      sectionId="keywords"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={true}
    >
      <EditableTextArea
        sectionId="keywords"
        value={value}
        onChange={onChange}
        placeholder="Enter keywords…"
        rows={6}
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
