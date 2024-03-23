const fs = require("fs").promises; // Use the promise-based version of the fs module
const path = require("path");

const tsvFilePath = path.join(__dirname, "input.tsv");

async function processTsvFile() {
  try {
    const data = await fs.readFile(tsvFilePath, "utf8");
    const rows = data.split("\n").slice(1); // Skip header row
    const namespaces = {};

    rows.forEach((row) => {
      if (!row.trim()) return; // Skip empty rows

      const [namespace, key, en, vi] = row.split("\t");
      if (!namespace || !key) return; // Skip rows with empty namespace or key

      // Initialize namespace object if not already done
      if (!namespaces[namespace]) {
        namespaces[namespace] = { en: {}, vi: {} };
      }

      // Assign translations to the correct language within the namespace
      namespaces[namespace].en[key] = en;
      namespaces[namespace].vi[key] = vi;
    });

    // Process each namespace and language
    for (const namespace of Object.keys(namespaces)) {
      for (const lang of Object.keys(namespaces[namespace])) {
        const dirPath = path.join(__dirname, "output", lang);
        const filePath = path.join(dirPath, `${namespace}.json`);

        // Ensure the directory exists
        await fs.mkdir(dirPath, { recursive: true });

        // Write the JSON file
        await fs.writeFile(
          filePath,
          JSON.stringify(namespaces[namespace][lang], null, 2)
        );
        console.log(`Successfully wrote ${filePath}`);
      }
    }

    const nameSpaceList = Object.keys(namespaces).reduce(
      (acc, key) => ({
        ...acc,
        [key]: key,
      }),
      {}
    );
    console.log("\nNamespace List:\n", JSON.stringify(nameSpaceList), "\n");
  } catch (err) {
    console.error("Error processing the TSV file:", err);
  }
}

processTsvFile();
