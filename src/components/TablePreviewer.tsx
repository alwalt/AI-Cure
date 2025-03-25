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
import { useSessionFileStore } from "../store/useSessionFileStore"; // Import the store
import { PreviewResponse } from "@/types/files";

const fetchTablePreview = async ({
  queryKey,
}: {
  queryKey: any[];
}): Promise<PreviewResponse> => {
  const [_key, previewCsv] = queryKey;
  // Build query parameters for the API call.
  const params = new URLSearchParams({
    // session_id: sessionId,
    csv_filename: previewCsv || "", // Use previewCsv from Zustand
  });
  const response = await fetch(
    `http://localhost:8000/api/preview_table?${params.toString()}`,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export default function TablePreviewer() {
  // Access sessionId and previewCsv from Zustand store
  // const sessionId = useSessionFileStore((state) => state.sessionId);
  const previewCsv = useSessionFileStore((state) => state.previewCsv);

  const { data, error, isLoading } = useQuery({
    queryKey: ["tablePreview", previewCsv], // Use previewCsv here
    queryFn: fetchTablePreview,
    enabled: !!previewCsv, // Only fetch if previewCsv is available
  });

  if (!previewCsv) {
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
              Table Preview: {previewCsv}
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
