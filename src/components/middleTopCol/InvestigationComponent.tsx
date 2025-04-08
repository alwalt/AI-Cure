import AiGenerateButton from "@/components/base/AiGenerateButton";

export default function InvestigationComponent() {
  return (
    <div className="overflow-x-auto">
      <div className="rounded overflow-hidden border border-grey">
        <table className="min-w-full bg-grey">
          <thead>
            <tr>
              <th className="border border-brightGrey px-2 py"></th>
              <th className="border border-brightGrey px-2 py">Description</th>
              <th className="border border-brightGrey px-2 py">Title</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-brightGrey px-2 py-2">
                <AiGenerateButton />
              </td>
              <td className="border border-brightGrey px-2 py-2">
                Description note
              </td>
              <td className="border border-brightGrey px-2 py-2">
                Description title
              </td>
            </tr>
            <tr>
              <td className="border border-brightGrey px-2 py-2">
                <AiGenerateButton />
              </td>
              <td className="border border-brightGrey px-2 py-2">
                Description text
              </td>
              <td className="border border-brightGrey px-2 py-2">Test entry</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
