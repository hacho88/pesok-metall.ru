import { generateAllGeoArticles } from "../../src/lib/ai/geo-article-generator";

async function main() {
  console.log("=== Generating geo articles for all zones ===");
  const result = await generateAllGeoArticles();
  console.log(`\nGenerated: ${result.generated}`);
  if (result.errors.length) {
    console.log("Errors:");
    result.errors.forEach((e) => console.log(`  - ${e.zone}: ${e.error}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
