import { useState } from "react";

interface AssaysTableProps {
  // Remove the complex props - keep it simple
}

export const AssaysTable: React.FC<AssaysTableProps> = () => {
  // Initialize a 4x5 grid for the data rows (4 rows, 5 columns)
  const [tableData, setTableData] = useState<string[][]>([
    ["", "", "", "", ""], // Row 1
    ["", "", "", "", ""], // Row 2
    ["", "", "", "", ""], // Row 3
    ["", "", "", "", ""], // Row 4
  ]);

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  const columnHeaders = [
    "Sample Name",
    "Protein",
    "Imaging Method",
    "Blocking Duration",
    "Block Concentration",
  ];

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-gray border border-gray rounded-lg shadow-sm">
        <thead className="bg-brightGray">
          <tr>
            {columnHeaders.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-primaryWhite uppercase tracking-wider border-b"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-unSelectedBlack">
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className="px-2 py-2 border-r border-gray-200 last:border-r-0"
                >
                  <textarea
                    value={cell}
                    onChange={(e) =>
                      handleCellChange(rowIndex, colIndex, e.target.value)
                    }
                    className="w-full min-h-[60px] p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-primaryBlue focus:border-transparent bg-selectedBlack text-primaryWhite"
                    placeholder={`Enter ${columnHeaders[
                      colIndex
                    ].toLowerCase()}...`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
