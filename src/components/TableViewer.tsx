import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

interface TablePreviewerProps {
  sessionId: string;
  csvFilename?: string; // When undefined, the previewer stays empty.
}

interface PreviewResponse {
  columns: string[];
  preview: Array<Record<string, any>>; // Each row is an object with keys matching the columns.
}

const fetchTablePreview = async ({
  queryKey,
}: {
  queryKey: any[];
}): Promise<PreviewResponse> => {
  const [_key, sessionId, csvFilename] = queryKey;
  console.log("fetch table preview, queryKey", queryKey);
  // Build query parameters for the API call.
  const params = new URLSearchParams({
    session_id: sessionId,
    csv_filename: csvFilename,
  });
  const response = await fetch(
    `http://localhost:8000/api/preview_table?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  console.log("res from fetching preview table: ", response.formData);
  return response.json();
};

export default function TablePreviewer({
  sessionId,
  csvFilename,
}: TablePreviewerProps) {
  console.log("useQuery enabled:", !!csvFilename);
  // Only fetch the preview when a CSV filename is provided.
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["tablePreview", sessionId, csvFilename],
    queryFn: fetchTablePreview,
    enabled: !!csvFilename,
  });

  console.log("TablePreviewer csvFilename:", csvFilename);

  if (!csvFilename) {
    console.log("No csvFilename, TablePreviewer not rendering.");
    return null;
  }

  useEffect(() => {
    console.log("Refetching table preview...");
    refetch();
  }, [refetch]);

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">Error loading preview.</Typography>
        ) : data ? (
          <>
            <Typography variant="h6" gutterBottom>
              Table Preview: {csvFilename}
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {data.columns.map((col, index) => (
                      <TableCell key={index}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.preview.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {data.columns.map((col, colIndex) => (
                        <TableCell key={colIndex}>{row[col]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
