from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("OSDRServer")

@mcp.tool(description="Fetch NASA‐OSDR dataset metadata.")
async def osdr_fetch_metadata(dataset_id: str) -> dict:
    url = f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()
    return data.get(dataset_id, {}).get("metadata", {})

@mcp.tool(description="List studies by organism.")
async def osdr_find_by_organism(organism: str) -> list:
    url = f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/*/metadata/organism/{organism}/"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()
    return [{"id":ds, "org":det["metadata"]["organism"]} for ds,det in data.items()]

if __name__ == "__main__":
    mcp.run(transport="stdio")