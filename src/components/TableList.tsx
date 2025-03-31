"use client";
import { useState } from "react";
import { useSessionFileStore } from "@/store/useSessionFileStore"; // Import the store

interface Table {
  csv_filename: string;
  display_name: string;
}

interface TableListProps {
  tables: Table[];
  onTableSelect?: (selectedTables: Table[]) => void;
}

export default function TableList({ tables, onTableSelect }: TableListProps) {
  const [selectedTables, setSelectedTables] = useState<Table[]>([]);
  // const sessionId = useSessionFileStore((state) => state.sessionId);
  const handlePreview = useSessionFileStore((state) => state.handlePreview);

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
      <div className="p-2 bg-panelBlack rounded text-primaryWhite text-center">
        <p>No tables available.</p>
        <p>Please upload a file first.</p>
      </div>
    );
  }

  return (
    <div className="bg-panelBlack border-grey border rounded p-2">
      <h3 className="text-lg font-semibold text-primaryWhite bg-panelBlack mb-2">
        Available Tables
      </h3>

      {/* Scrollable container */}
      <div className="max-h-[400px] overflow-y-auto bg-unSelectedBlack rounded">
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
                    ? "bg-selectedBlack text-primaryWhite"
                    : "bg-unSelectedBlack hover:bg-selectedBlack hover:rounded-none border border-transparent transition-colors"
                }
              `}
              onClick={() => handleTableSelect(table)}
            >
              <div className="flex items-center space-x-3 bg-unSelectedBlack">
                <input
                  type="checkbox"
                  checked={selectedTables.some(
                    (t) => t.csv_filename === table.csv_filename
                  )}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleTableSelect(table)}
                  className="h-4 w-4 text-primaryWhite bg-unSelectedBlack rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`table-checkbox-${idx}`} className="sr-only">
                  Select {table.display_name}
                </label>
                <div>
                  <p className="text-primaryWhite text-sm">
                    {table.csv_filename}
                  </p>
                  <p className="text-xs text-primaryWhite">
                    {table.display_name}
                  </p>
                </div>
              </div>

              {/* Preview/Actions buttons */}
              <div className="flex flex-col items-center text-right">
                <button
                  className="px-3 py-1 text-sm text-primaryWhite hover:bg-redFill hover:text-primaryWhite rounded duration-300 transition-colors"
                  onClick={() => handlePreview(table.csv_filename)}
                >
                  Preview
                </button>
                <button
                  className="px-3 py-1 text-sm text-primaryWhite hover:bg-redFill hover:text-primaryWhite rounded duration-300 transition-colors"
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
        <div className=" mt-2 p-2 bg-blue-50 rounded bg-selectedBlack border-primaryWhite border">
          <p className="text-sm bg-selectedBlack">
            {selectedTables.length} table
            {selectedTables.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}
    </div>
  );
}
