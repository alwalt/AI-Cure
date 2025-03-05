"use client";
import { useState, useEffect } from "react";

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

export default function TableList({
  tables,
  onTableSelect,
  onPreview,
  sessionId,
}: TableListProps) {
  const [selectedTables, setSelectedTables] = useState<Table[]>([]);

  const handleTableSelect = (table: Table) => {
    setSelectedTables((prev) => {
      const isSelected = prev.some(
        (t) => t.csv_filename === table.csv_filename
      );
      const newSelection = isSelected
        ? prev.filter((t) => t.csv_filename !== table.csv_filename)
        : [...prev, table];

      onTableSelect?.(newSelection);
      return newSelection;
    });
  };

  if (!tables.length) {
    return (
      <div className="p-2 bg-gray-100 rounded text-gray-500 text-center">
        No tables available. Please upload a file first.
      </div>
    );
  }

  return (
    <div className="bg-gray-200 rounded p-2">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Available Tables
      </h3>

      {/* Scrollable container */}
      <div className="max-h-[400px] overflow-y-auto bg-primaryWhite rounded">
        <div>
          {tables.map((table, idx) => (
            <div
              key={table.csv_filename}
              className={`
                flex items-stretch justify-between w-full
                p-2 cursor-pointer
                ${
                  selectedTables.some(
                    (t) => t.csv_filename === table.csv_filename
                  )
                    ? "bg-blue-100"
                    : "bg-primaryWhite hover:bg-gray-100 hover:rounded-none border border-transparent transition-colors"
                }
              `}
              onClick={() => handleTableSelect(table)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedTables.some(
                    (t) => t.csv_filename === table.csv_filename
                  )}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleTableSelect(table)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`table-checkbox-${idx}`} className="sr-only">
                  Select {table.display_name}
                </label>
                <div>
                  <p className="text-gray-700 text-sm">{table.display_name}</p>
                  <p className="text-xs text-gray-500">{table.display_name}</p>
                </div>
              </div>

              {/* Preview/Actions buttons */}
              <div className="flex flex-col items-center text-right">
                <button
                  className="px-3 py-1 text-sm text-primaryBlue hover:bg-redFill hover:text-primaryWhite rounded duration-300 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview?.(table.csv_filename, sessionId);
                  }}
                >
                  Preview
                </button>
                <button
                  className="px-3 py-1 text-sm text-primaryBlue hover:bg-redFill hover:text-primaryWhite rounded duration-300 transition-colors"
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
        <div className=" mt-2 p-2 bg-blue-50 rounded border-primaryBlue border">
          <p className="text-sm text-primaryBlue">
            {selectedTables.length} table
            {selectedTables.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}
    </div>
  );
}
