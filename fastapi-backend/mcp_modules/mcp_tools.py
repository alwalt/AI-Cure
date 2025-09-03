from mcp.server.fastmcp import FastMCP
import httpx
import matplotlib
matplotlib.use("Agg")
import pandas as pd
import matplotlib.pyplot as plt
from io import StringIO
import os
from pathlib import Path


mcp = FastMCP("OSDRServer")

@mcp.tool(description="Fetch NASA‐OSDR dataset metadata.")
async def osdr_fetch_metadata(dataset_id: str) -> dict:
    url = f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()
    return data.get(dataset_id, {}).get("metadata", {})

# @mcp.tool(description="List studies by organism.")
# async def osdr_find_by_organism(organism: str) -> list:
#     url = f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/*/metadata/organism/{organism}/"
#     async with httpx.AsyncClient() as client:
#         resp = await client.get(url)
#         resp.raise_for_status()
#         data = resp.json()
#     return [{"id":ds, "org":det["metadata"]["organism"]} for ds,det in data.items()]

@mcp.tool(description="Plot top 10 RNA counts and summarize for a dataset from the OSDR unnormalized counts API.")
async def osdr_plot_top_rna(dataset_id: str) -> dict:
    """
    Fetches RNA count data for a given OSDR dataset, plots the top 10 expressed genes,
    saves the data and plot locally, and returns the file paths and a textual summary.
    """

    base_url = "https://visualization.osdr.nasa.gov/biodata/api/v2/query/data/"
    query_url = f"{base_url}?id.accession={dataset_id}&file.data%20type=unnormalized%20counts"

    async with httpx.AsyncClient(follow_redirects=True, timeout=60.0) as client:
        response = await client.get(query_url)
        if response.status_code != 200:
            raise RuntimeError(f"Failed to fetch data: {response.status_code}")

        try:
            df = pd.read_csv(StringIO(response.text))
        except Exception as e:
            preview = response.text[:300]
            raise RuntimeError(f"Could not parse CSV. Preview:\n{preview}") from e

    if df.empty:
        raise ValueError("No data returned from the API.")

    # Save raw data
    # data_path = f"{dataset_id}_unnormalized_counts.csv"
    # df.to_csv(data_path, index=False)

    # Calculate top genes
    gene_counts = df.drop(columns=[df.columns[0]]).sum(axis=1)
    top_genes = gene_counts.nlargest(10)
    top_gene_names = df.iloc[top_genes.index, 0]

    # Save plot
    plt.figure(figsize=(10, 6))
    plt.bar(top_gene_names, top_genes)
    plt.xticks(rotation=45, ha='right')
    plt.ylabel("Total Count")
    plt.title(f"Top 10 Expressed Genes in {dataset_id}")
    plt.tight_layout()

    env_dir = os.getenv("OSDR_PLOTS_DIR")
    if env_dir:
        plot_dir = Path(env_dir)
    else:
        plot_dir = Path(__file__).resolve().parent.parent / "plots"
    plot_dir.mkdir(parents=True, exist_ok=True)

    plot_path = plot_dir / f"{dataset_id}_top10_rna.png"
    plt.savefig(plot_path)
    plt.close()

    # Build summary text
    summary_lines = [f"Top 10 expressed genes in study {dataset_id}:"]
    for name, count in zip(top_gene_names, top_genes):
        summary_lines.append(f"- {name}: {int(count):,} counts")

    summary_text = "\n".join(summary_lines)

    # Save summary to file
    # summary_path = f"{dataset_id}_top10_summary.txt"
    # with open(summary_path, "w") as f:
    #     f.write(summary_text)

    return {
        "dataset_id": dataset_id,
        "summary": summary_text,
        # "summary_file": os.path.abspath(summary_path),
        # "data_file": os.path.abspath(data_path),
        "plot_file": str(Path(plot_path).resolve()),
    }

if __name__ == "__main__":
    mcp.run(transport="stdio")
