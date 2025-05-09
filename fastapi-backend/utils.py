import pandas as pd
import numpy as np
import os
import logging
from typing import List
import ollama

UPLOAD_DIR = "uploaded_files"
OUTPUT_DIR = "output_tables"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

SESSION_TABLES = {}

###############################################################################
# Utility Functions
############################################################################### 
def is_blank_cell(val):
    if pd.isna(val):
        return True
    if str(val).strip() == "":
        return True
    return False

def detect_tables_in_sheet(df):
    blank_map = df.isna() | df.apply(lambda col: col.map(lambda x: str(x).strip() == ""))
    nrows, ncols = df.shape

    visited = np.full((nrows, ncols), False, dtype=bool)

    def in_bounds(r, c):
        return (0 <= r < nrows) and (0 <= c < ncols)

    def dfs_collect(r, c, coords):
        stack = [(r, c)]
        visited[r, c] = True
        while stack:
            rr, cc = stack.pop()
            coords.append((rr, cc))
            for (dr, dc) in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = rr+dr, cc+dc
                if in_bounds(nr, nc) and not visited[nr, nc]:
                    if not blank_map.iloc[nr, nc]:
                        visited[nr, nc] = True
                        stack.append((nr, nc))

    connected_components = []
    for row_i in range(nrows):
        for col_i in range(ncols):
            if not visited[row_i, col_i] and not blank_map.iloc[row_i, col_i]:
                coords = []
                dfs_collect(row_i, col_i, coords)
                connected_components.append(coords)

    table_dfs = []
    for coords in connected_components:
        rows = [r for (r, _) in coords]
        cols = [c for (_, c) in coords]
        min_r, max_r = min(rows), max(rows)
        min_c, max_c = min(cols), max(cols)
        sub_df = df.iloc[min_r:max_r+1, min_c:max_c+1]
        table_dfs.append(sub_df)

    return table_dfs

def clean_dataframe(df):
    # Replace NaN and Infinity values
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.fillna('')  # or use another strategy like df.fillna('')

    return df

def segment_and_export_tables(xlsx_path, session_id) -> List[str]:
    """
    Optimized table detection and export
    """
    logging.info(f"Processing Excel file: {xlsx_path}")
    xls = pd.ExcelFile(xlsx_path)
    results = []

    for sheet_name in xls.sheet_names:
        logging.info(f"Processing sheet: {sheet_name}")
        df_sheet = xls.parse(sheet_name)
        
        # Simplified table detection for small files
        if df_sheet.shape[0] < 50 and df_sheet.shape[1] < 50:
            # Treat entire sheet as one table
            csv_name = f"{sheet_name}_table.csv"
            csv_path = os.path.join(OUTPUT_DIR, csv_name)
            df_sheet.to_csv(csv_path, index=False)
            results.append((csv_path, csv_name))
            logging.info(f"Exported table: {csv_name}")
            continue
            
        # Original DFS logic for larger files
        table_dfs = detect_tables_in_sheet(df_sheet)
        
        for idx, tbl in enumerate(table_dfs, start=1):
            # Simple naming instead of summarization for small files
            csv_name = f"{sheet_name}_table_{idx}.csv"
            csv_path = os.path.join(OUTPUT_DIR, csv_name)
            tbl.to_csv(csv_path, index=False)
            results.append((csv_path, csv_name))
            logging.info(f"Exported table: {csv_name}")

    SESSION_TABLES[session_id] = results
    return results

def create_table_summary_prompt(table_df):
    # Comprehensive text representation of the table
    table_text = f"""
    Dimensions: {table_df.shape[0]} rows × {table_df.shape[1]} columns
    Column Names: {', '.join(table_df.columns.tolist())}

    Statistical Summary:
    {table_df.describe().to_string()}

    Table Data (all rows):
    {table_df.to_string()}
    """
    # Prompt for LLM
    prompt = f"""Analyze this tabular data and extract key insights.

    Output your analysis in JSON format with the following structure:
    {{
    "summary": "Comprehensive description of the table data",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
    }}

    Here is the table information:
    {table_text}
    """

    return prompt

def get_magic_wand_suggestions(context, model, vectorstore):
    col_to_question = {'Description':'What is the Description?',
    'Author List': 'What is the list of Author? Return the person(s) first name, middle initials, and last name.',
    'Title': 'What is the Title?',
    'PubMed ID':'Are there any PubMed identifiers? If so, return PubMed ids as list otherwise return None.',
    'Publication DOI':'Are there any Publication DOIs? If so, return Publication DOIs as list otherwise return None.',
    'Submission Date':'Is a Submission Date listed? If so, return Submission Date as list otherwise return None.',
    'Public Release Date':'Is a Public Release Date listed? If so, return Public Release Date as list otherwise return None.',
    'Study Assays':'Are there any Study Assays list? Some example Study Assays are RNA-seq, Microscopy, and Protein expression. If Study Assays are listed, return Study Assays as list otherwise return None.',
    'Study Factor Type':'Are there any Factor Type Assays list? Some example Study Factor Types are Space Flight, Ionizing Radiation, and Altered Gravity. If Study Assays are listed, return Study Assays as list otherwise return None.',
    }
    #
    json_output = {}
    for col, question in col_to_question.items():
        res = ollama.chat(
            model=model,
            messages=[
                {
                    "role":"user",
                    'content': f"You are a helpful AI. Use the following context to answer the question:\n\nContext: {context}\n\nQuestion: {question}\n. Only return the answer.",
                }
            ]
        )
        json_output[col] = res['message']['content']
        print(json_output[col])
    return json_output

