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
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query";
import { useSessionFileStore } from "@/store/useSessionFileStore"; // Import the store
import { PreviewResponse } from "@/types/files";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@config";
import { apiBase } from "@/lib/api";

const fullConfig = resolveConfig(tailwindConfig);
const greyColor = fullConfig.theme.colors.grey;
const primaryBlack = fullConfig.theme.colors.primaryBlack;
const primaryWhite = fullConfig.theme.colors.primaryWhite;
const unSelectedBlack = fullConfig.theme.colors.unSelectedBlack;

const fetchTablePreview = async ({
  queryKey,
}: QueryFunctionContext<[string, string?]>): Promise<PreviewResponse> => {
  const [, previewCsv] = queryKey;
  // Build query parameters for the API call.
  const params = new URLSearchParams({
    // session_id: sessionId,
    csv_filename: previewCsv || "", // Use previewCsv from Zustand
  });
  const response = await fetch(
    `${apiBase}/api/preview_table?${params.toString()}`,
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
  const previewCsv = useSessionFileStore((state) => state.previewCsv);

  const { data, error, isLoading } = useQuery<
    PreviewResponse, // TData
    Error, // TError
    PreviewResponse, // TQueryFnData
    [string, string] // TQueryKey
  >({
    queryKey: ["tablePreview", previewCsv!], // assert non-null
    queryFn: fetchTablePreview,
    enabled: !!previewCsv, // only runs when previewCsv is truthy
  });
  console.log("Preview button clicked????? in TablePreviewer func");
  if (!previewCsv) {
    return null;
  }

  return (
    <Card
      sx={{
        mt: 3,
        bgcolor: unSelectedBlack,
        color: primaryWhite,
        border: `1px solid ${greyColor}`,
      }}
    >
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
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: "40vh", // or 40vh, adjust as needed
                overflowY: "auto",
                border: `1px solid ${greyColor}`,
                bgcolor: primaryBlack,
                color: primaryWhite,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {data.columns.map((col, index) => (
                      <TableCell key={index} sx={{ color: primaryWhite }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.preview.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {data.columns.map((col, colIndex) => (
                        <TableCell key={colIndex} sx={{ color: primaryWhite }}>
                          {row[col]}
                        </TableCell>
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
