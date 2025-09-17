import { useEffect, useRef, useState } from "react";

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

  // Autocomplete state
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPlacement, setDropdownPlacement] = useState<"bottom" | "top">("bottom");
  const activeInputRef = useRef<HTMLInputElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; minWidth: number } | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!activeCell) return;
      const colName = columnHeaders[activeCell.col];
      try {
        const res = await fetch(`/api/assays/suggestions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template: "western-blot", column: colName, query, max: 20 }),
        });
        const data = await res.json();
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setHighlightIdx(0);
      } catch {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [activeCell, query]);

  // Recalculate dropdown placement when suggestions change or on window resize
  useEffect(() => {
    const recalc = () => {
      if (!activeInputRef.current || suggestions.length === 0) return;
      const rect = activeInputRef.current.getBoundingClientRect();
      const estimatedDropdownHeight = 200; // px, roughly max-h-40 + padding
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const placeTop = spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow;
      setDropdownPlacement(placeTop ? "top" : "bottom");

      const top = placeTop ? Math.max(4, rect.top - estimatedDropdownHeight - 4) : rect.bottom + 4;
      setDropdownStyle({ top, left: rect.left, minWidth: rect.width });
    };
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [suggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!activeCell) return;
      const target = e.target as Node;
      if (activeInputRef.current && activeInputRef.current.contains(target)) return;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      setActiveCell(null);
      setSuggestions([]);
    };
    document.addEventListener("mousedown", onDocMouseDown, true);
    return () => document.removeEventListener("mousedown", onDocMouseDown, true);
  }, [activeCell]);

  const applySuggestion = (value: string) => {
    if (!activeCell) return;
    handleCellChange(activeCell.row, activeCell.col, value);
    setActiveCell(null);
    setSuggestions([]);
    setQuery("");
  };

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
                  className="px-2 py-2 border-r border-gray-200 last:border-r-0 relative"
                >
                  <div className="relative">
                    {/* Ghost inline suggestion overlay */}
                    {activeCell && activeCell.row === rowIndex && activeCell.col === colIndex && suggestions.length > 0 && query.length > 0 && (
                      (() => {
                        const first = suggestions[0] as string;
                        const q = (query || "").toLowerCase();
                        const starts = first.toLowerCase().startsWith(q);
                        const suffix = starts ? first.slice(query.length) : "";
                        return suffix ? (
                          <div className="pointer-events-none absolute inset-0 px-2 py-2 text-sm flex items-center">
                            <span className="opacity-0 select-none">{cell}</span>
                            <span className="text-gray-300">{suffix}</span>
                          </div>
                        ) : null;
                      })()
                    )}

                    <input
                      value={cell}
                      onFocus={() => {
                        setActiveCell({ row: rowIndex, col: colIndex });
                        setQuery(cell);
                        // store the focused input element
                        // will be set by ref below
                      }}
                      onChange={(e) => {
                        handleCellChange(rowIndex, colIndex, e.target.value);
                        if (activeCell && activeCell.row === rowIndex && activeCell.col === colIndex) {
                          setQuery(e.target.value);
                        }
                      }}
                      ref={(el) => {
                        if (activeCell && activeCell.row === rowIndex && activeCell.col === colIndex) {
                          activeInputRef.current = el;
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!activeCell) return;
                        if (e.key === "ArrowDown" && suggestions.length > 0) {
                          e.preventDefault();
                          setHighlightIdx((i) => Math.min(i + 1, Math.max(suggestions.length - 1, 0)));
                          return;
                        }
                        if (e.key === "ArrowUp" && suggestions.length > 0) {
                          e.preventDefault();
                          setHighlightIdx((i) => Math.max(i - 1, 0));
                          return;
                        }
                        if (e.key === "Tab" || e.key === "Enter") {
                          const first = suggestions[0];
                          if (first) {
                            e.preventDefault();
                            applySuggestion(first);
                            return;
                          }
                        }
                        if (e.key === "Escape") {
                          setActiveCell(null);
                          setSuggestions([]);
                        }
                      }}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-selectedBlue focus:border-transparent bg-selectedBlack text-primaryWhite placeholder:text-gray-300 focus:placeholder-transparent"
                      placeholder={`Enter ${columnHeaders[colIndex].toLowerCase()}...`}
                    />
                  </div>

                  {/* Dropdown suggestions */}
                  {activeCell && activeCell.row === rowIndex && activeCell.col === colIndex && suggestions.length > 0 && dropdownStyle && (
                    <div
                      ref={dropdownRef}
                      className={`fixed z-50 max-h-40 overflow-auto w-max min-w-[10rem] max-w-[50vw] bg-gray-800 border border-gray-600 rounded shadow-lg p-1`}
                      style={{ top: dropdownStyle.top, left: dropdownStyle.left, minWidth: dropdownStyle.minWidth }}
                      role="listbox"
                    >
                      {suggestions.slice(0, 20).map((s, i) => (
                        <div
                          key={`${s}-${i}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            applySuggestion(s);
                          }}
                          className={`px-2 py-1 cursor-pointer text-sm max-w-[100ch] whitespace-normal break-words ${
                            i === highlightIdx ? "bg-blue-700 text-white" : "text-gray-200 hover:bg-gray-700"
                          }`}
                          role="option"
                          aria-selected={i === highlightIdx}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
