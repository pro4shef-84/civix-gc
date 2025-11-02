import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const dataPath = join(__dirname, "..", "data", "sample-data.json");
  const raw = await readFile(dataPath, "utf8");
  JSON.parse(raw);
  console.log("✓ sample-data.json parsed successfully");
}

main().catch((error) => {
  console.error("Failed to validate sample data", error);
  process.exitCode = 1;
});
