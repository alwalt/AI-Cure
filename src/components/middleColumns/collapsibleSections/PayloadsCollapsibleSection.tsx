// src/components/collapsibleSections/PayloadsCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface PayloadsCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function PayloadsCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: PayloadsCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="payload"
      sectionId="payload"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={false}
    >
      <EditableTextArea
        sectionId="payload"
        value={value}
        onChange={onChange}
        placeholder="Enter payload information…"
        rows={4}
        maxHeight="320px"
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
