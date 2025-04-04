export default function StudyComponent() {
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
              <td className="border border-brightGrey px-2 py-2">Alpha</td>
              <td className="border border-brightGrey px-2 py-2">Study note</td>
              <td className="border border-brightGrey px-2 py-2">
                Study title
              </td>
            </tr>
            <tr>
              <td className="border border-brightGrey px-2 py-2">Beta</td>
              <td className="border border-brightGrey px-2 py-2">Study text</td>
              <td className="border border-brightGrey px-2 py-2">
                Study entry
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
