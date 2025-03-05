"use client";
import React from "react";
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
  csvFilename?: string;
}

interface PreviewResponse {
  columns: string[];
  preview: Array<Record<string, any>>;
}

const fetchTablePreview = async ({
  queryKey,
}: {
  queryKey: any[];
}): Promise<PreviewResponse> => {
  const [_key, sessionId, csvFilename] = queryKey;
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
  return response.json();
};

export default function TablePreviewer({
  sessionId,
  csvFilename,
}: TablePreviewerProps) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["tablePreview", sessionId, csvFilename],
    queryFn: fetchTablePreview,
    enabled: !!csvFilename,
  });

  if (!csvFilename) {
    return null;
  }

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
