import AiGenerateButton from "@/components/base/AiGenerateButton";

export default function InvestigationComponent() {
  return (
    <div className="w-full overflow-auto">
      <div className="min-w-[400px] max-w-[850px] rounded overflow-hidden border border-grey">
        <table className="w-full bg-grey">
          <thead>
            <tr>
              <th className="border border-brightGrey px-2 py"></th>
              <th className="border border-brightGrey px-2 py">Column name</th>
              <th className="border border-brightGrey px-2 py">Column Value</th>
              <th className="border border-brightGrey px-2 py">
                LLM Generation
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-brightGrey px-2 py-2">
                <AiGenerateButton />
              </td>
              <td className="border border-brightGrey px-2 py-2">
                Description
              </td>
              <td className="border border-brightGrey px-2 py-2">
                Superconducting Magnetic Energy Storage (SMES) stores electrical
                energy in the form of a magnetic field using a superconducting
                coil, offering high efficiency and fast response times.
              </td>
              <td className="border border-brightGrey px-2 py-2">
                LLM Generation goes here
              </td>
            </tr>
            <tr>
              <td className="border border-brightGrey px-2 py-2">
                <AiGenerateButton />
              </td>
              <td className="border border-brightGrey px-2 py-2">Title</td>
              <td className="border border-brightGrey px-2 py-2">Test entry</td>
              <td className="border border-brightGrey px-2 py-2">Test entry</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
