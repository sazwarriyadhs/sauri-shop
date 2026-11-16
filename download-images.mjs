
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.PEXELS_API_KEY;
const OUTPUT_DIR = path.join(__dirname, "public", "products");
const REPORT_FILE = path.join(OUTPUT_DIR, "download-report.json");

const DELAY_MS = 700;
const MAX_RETRIES = 3;

if (!API_KEY) {
  console.error("ERROR: PEXELS_API_KEY belum diatur.");
  console.error('PowerShell: $env:PEXELS_API_KEY = "API_KEY_BARU"');
  process.exit(1);
}

const products = [
  // POULTRY
  { sku: "SAU-PLY-001", name: "Whole Chicken", query: "raw whole chicken fresh poultry" },
  { sku: "SAU-PLY-002", name: "Chicken Carcass", query: "raw chicken carcass poultry" },
  { sku: "SAU-PLY-003", name: "Chicken Breast Boneless", query: "raw boneless chicken breast" },
  { sku: "SAU-PLY-004", name: "Chicken Breast Bone-in", query: "raw bone in chicken breast" },
  { sku: "SAU-PLY-005", name: "Chicken Thigh", query: "raw chicken thighs" },
  { sku: "SAU-PLY-006", name: "Chicken Drumstick", query: "raw chicken drumsticks" },
  { sku: "SAU-PLY-007", name: "Chicken Wings", query: "raw chicken wings" },
  { sku: "SAU-PLY-008", name: "Chicken Feet", query: "raw chicken feet" },
  { sku: "SAU-PLY-009", name: "Chicken Skin", query: "raw chicken skin" },
  { sku: "SAU-PLY-010", name: "Chicken Liver and Gizzard", query: "fresh raw chicken liver gizzard" },

  // FRESH FISH
  { sku: "SAU-FSH-001", name: "Tuna", query: "fresh whole tuna fish" },
  { sku: "SAU-FSH-002", name: "Salmon", query: "fresh whole salmon fish" },
  { sku: "SAU-FSH-003", name: "Red Snapper", query: "fresh red snapper fish" },
  { sku: "SAU-FSH-004", name: "Gurame", query: "fresh gourami fish" },
  { sku: "SAU-FSH-005", name: "Tilapia", query: "fresh tilapia fish" },
  { sku: "SAU-FSH-006", name: "Catfish", query: "fresh catfish" },
  { sku: "SAU-FSH-007", name: "Pangasius", query: "fresh pangasius fish" },
  { sku: "SAU-FSH-008", name: "Mackerel Tuna", query: "fresh mackerel tuna fish" },
  { sku: "SAU-FSH-009", name: "Spanish Mackerel", query: "fresh spanish mackerel fish" },
  { sku: "SAU-FSH-010", name: "Milkfish", query: "fresh milkfish bandeng" },
  { sku: "SAU-FSH-011", name: "Shrimp", query: "fresh raw shrimp seafood" },
  { sku: "SAU-FSH-012", name: "Squid", query: "fresh raw squid seafood" },

  // FISH PROCESSING
  { sku: "SAU-FPR-001", name: "Tuna Fillet", query: "fresh raw tuna fillet" },
  { sku: "SAU-FPR-002", name: "Salmon Fillet", query: "fresh raw salmon fillet" },
  { sku: "SAU-FPR-003", name: "Snapper Fillet", query: "fresh red snapper fillet" },
  { sku: "SAU-FPR-004", name: "Tuna Loin", query: "fresh tuna loin raw" },
  { sku: "SAU-FPR-005", name: "Fish Steak", query: "fresh raw fish steak cut" },
  { sku: "SAU-FPR-006", name: "Fish Mince", query: "raw minced fish seafood" },
  { sku: "SAU-FPR-007", name: "Peeled Shrimp", query: "peeled raw shrimp seafood" },
  { sku: "SAU-FPR-008", name: "Cleaned Squid", query: "cleaned raw squid seafood" },
  { sku: "SAU-FPR-009", name: "Fish Nugget", query: "fish nuggets food" },
  { sku: "SAU-FPR-010", name: "Fish Ball", query: "fish balls seafood food" },
  { sku: "SAU-FPR-011", name: "Fish Cake", query: "fish cake seafood food" },
  { sku: "SAU-FPR-012", name: "Fish Sausage", query: "fish sausage seafood food" },

  // PETFOOD
  { sku: "SAU-PET-001", name: "Adult Dog Food", query: "premium dry adult dog food kibble" },
  { sku: "SAU-PET-002", name: "Puppy Food", query: "premium puppy dry food kibble" },
  { sku: "SAU-PET-003", name: "Adult Cat Food", query: "premium adult cat food kibble" },
  { sku: "SAU-PET-004", name: "Kitten Food", query: "premium kitten food kibble" },
  { sku: "SAU-PET-005", name: "Wet Petfood", query: "wet pet food can" },
  { sku: "SAU-PET-006", name: "Frozen Raw Petfood", query: "frozen raw pet food" },
  { sku: "SAU-PET-007", name: "Chicken Pet Treats", query: "natural chicken dog treats" },
  { sku: "SAU-PET-008", name: "Fish Pet Treats", query: "natural fish cat dog treats" },

  // ANIMAL OIL & NUTRITION
  { sku: "SAU-OIL-FISH-001", name: "Fish Oil", query: "golden fish oil in glass bottle" },
  { sku: "SAU-OIL-FISH-002", name: "Salmon Fish Oil", query: "salmon fish oil bottle" },
  { sku: "SAU-OIL-FISH-003", name: "Tuna Fish Oil", query: "tuna fish oil bottle" },
  { sku: "SAU-OIL-CHKN-001", name: "Chicken Oil", query: "golden chicken oil in glass bottle" },
  { sku: "SAU-OIL-CHKN-002", name: "Rendered Chicken Fat", query: "rendered chicken fat in glass jar" },
  { sku: "SAU-OIL-CHKN-003", name: "Chicken Oil Blend", query: "chicken oil golden liquid bottle" },
];

async function fetchWithRetry(url, options = {}) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000),
    });

    if (response.ok) return response;

    if (
      response.status === 429 ||
      response.status >= 500
    ) {
      if (attempt < MAX_RETRIES) {
        const wait = attempt * 3000;
        console.log(`  Retry ${attempt}/${MAX_RETRIES} dalam ${wait}ms`);
        await sleep(wait);
        continue;
      }
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  throw new Error("Melebihi batas retry.");
}

async function downloadProduct(product) {
  const fileName = `${product.sku}.jpg`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
    console.log(`[SKIP] ${product.sku} sudah tersedia.`);
    return { ...product, status: "SKIPPED", file: fileName };
  }

  try {
    const searchUrl = new URL("https://api.pexels.com/v1/search");
    searchUrl.searchParams.set("query", product.query);
    searchUrl.searchParams.set("per_page", "5");
    searchUrl.searchParams.set("orientation", "square");

    const searchResponse = await fetchWithRetry(searchUrl, {
      headers: { Authorization: API_KEY },
    });

    const searchData = await searchResponse.json();
    const photo = searchData.photos?.[0];

    if (!photo?.src?.large) {
      console.log(`[EMPTY] ${product.sku} - gambar tidak ditemukan.`);
      return { ...product, status: "NOT_FOUND" };
    }

    const imageResponse = await fetchWithRetry(photo.src.large);
    const contentType = imageResponse.headers.get("content-type") || "";

    if (!contentType.startsWith("image/")) {
      throw new Error(`Response bukan gambar: ${contentType}`);
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());

    if (buffer.length < 1000) {
      throw new Error("File gambar terlalu kecil atau tidak valid.");
    }

    fs.writeFileSync(filePath, buffer);

    console.log(`[OK] ${product.sku} - ${product.name}`);

    return {
      ...product,
      status: "DOWNLOADED",
      file: fileName,
      bytes: buffer.length,
      pexelsPhotoId: photo.id,
      photographer: photo.photographer,
      sourceUrl: photo.url,
    };
  } catch (error) {
    console.error(`[ERROR] ${product.sku}: ${error.message}`);
    return {
      ...product,
      status: "FAILED",
      error: error.message,
    };
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("======================================");
  console.log(" SAURI PRODUCT IMAGE DOWNLOADER");
  console.log(" 48 SKU | PEXELS API");
  console.log("======================================");
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const results = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    console.log(`[${i + 1}/${products.length}] ${product.name}`);

    const result = await downloadProduct(product);
    results.push(result);

    await sleep(DELAY_MS);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    total: results.length,
    downloaded: results.filter(x => x.status === "DOWNLOADED").length,
    skipped: results.filter(x => x.status === "SKIPPED").length,
    notFound: results.filter(x => x.status === "NOT_FOUND").length,
    failed: results.filter(x => x.status === "FAILED").length,
    results,
  };

  fs.writeFileSync(
    REPORT_FILE,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log("\n======================================");
  console.log(" DOWNLOAD SUMMARY");
  console.log("======================================");
  console.log(`Total       : ${report.total}`);
  console.log(`Downloaded  : ${report.downloaded}`);
  console.log(`Skipped     : ${report.skipped}`);
  console.log(`Not found   : ${report.notFound}`);
  console.log(`Failed      : ${report.failed}`);
  console.log(`Report      : ${REPORT_FILE}`);
  console.log("======================================");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
