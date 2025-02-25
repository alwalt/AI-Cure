"use client";
import { useState } from "react";

interface Table {
  csv_filename: string;
  display_name: string;
}

interface TableListProps {
  tables: Table[];
  onTableSelect?: (selectedTables: Table[]) => void;
  onPreview?: (csvFilename: string, sessionId: string) => void;
  sessionId: string;
}

export default function TableList({ tables, onTableSelect, onPreview, sessionId }: TableListProps) {
  const [selectedTables, setSelectedTables] = useState<Table[]>([]);

  const handleTableSelect = (table: Table) => {
    setSelectedTables((prev) => {
      const isSelected = prev.some(t => t.csv_filename === table.csv_filename);
      const newSelection = isSelected
        ? prev.filter((t) => t.csv_filename !== table.csv_filename)
        : [...prev, table];
      
      // Call the parent callback if provided
      onTableSelect?.(newSelection);
      return newSelection;
    });
  };

  if (!tables.length) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-gray-500 text-center">
        No tables available. Please upload a file first.
      </div>
    );
  }

  return (
    <div className="bg-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Tables</h3>
      
      {/* Scrollable container */}
      <div className="max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          {tables.map((table, idx) => (
            <div
              key={table.csv_filename}
              className={`
                flex items-center justify-between
                p-3 rounded-md transition-colors cursor-pointer
                ${
                  selectedTables.some(t => t.csv_filename === table.csv_filename)
                    ? "bg-blue-50 border-2 border-blue-500"
                    : "bg-white hover:bg-gray-50 border-2 border-transparent"
                }
              `}
              onClick={() => handleTableSelect(table)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedTables.some(t => t.csv_filename === table.csv_filename)}
                  onChange={() => handleTableSelect(table)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <p className="text-gray-700 font-medium">{table.display_name}</p>
                  <p className="text-sm text-gray-500">
                    {table.display_name}
                  </p>
                </div>
              </div>

              {/* Preview/Actions buttons */}
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Trigger the parent callback when preview is clicked.
                    onPreview?.(table.csv_filename, sessionId);
                  }}
                >
                  Preview
                </button>
                <button
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add download functionality
                    console.log(`Download ${table.csv_filename}`);
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection summary */}
      {selectedTables.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            {selectedTables.length} table{selectedTables.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}
