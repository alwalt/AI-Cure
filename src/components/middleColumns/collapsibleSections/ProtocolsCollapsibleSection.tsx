// src/components/collapsibleSections/ProtocolsCollapsibleSection.tsx
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";

interface ProtocolsCollapsibleSectionProps {
  onGenerate: (sectionId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  value: string;
  onChange: (sectionId: string, newValue: string) => void;
}

export default function ProtocolsCollapsibleSection({
  onGenerate,
  isLoading,
  disabled,
  value,
  onChange,
}: ProtocolsCollapsibleSectionProps) {
  return (
    <CollapsibleSection
      title="protocols"
      sectionId="protocols"
      onGenerate={onGenerate}
      isLoading={isLoading}
      disabled={disabled}
      initiallyOpen={false}
    >
      <EditableTextArea
        sectionId="protocols"
        value={value}
        onChange={onChange}
        placeholder="Enter protocols…"
        rows={5}
        maxHeight="400px"
        disabled={disabled}
      />
    </CollapsibleSection>
  );
}
