interface AssayEntry {
  sample_name: string;
  protein: string;
  imaging_method: string;
  blocking_duration: string;
  block_concentration: string;
}

interface AssaysTableProps {
  assaysData: AssayEntry[] | null;
  isLoading?: boolean;
}

export const AssaysTable: React.FC<AssaysTableProps> = ({
  assaysData,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!assaysData || assaysData.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        <p>
          No assay data available. Click "Generate with AI" to extract assay
          information.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Sample Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Protein
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Imaging Method
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Blocking Duration
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Block Concentration
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {assaysData.map((entry, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                {entry.sample_name || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                {entry.protein || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                {entry.imaging_method || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                {entry.blocking_duration || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                {entry.block_concentration || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
