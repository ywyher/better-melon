import { indexes } from "./lib/constants";
import { initializeDictionary } from "./utils/initialize";

const results = await Promise.all(
  indexes.map(dict => initializeDictionary(dict))
);

results.forEach((result, index) => {
  const dictName = indexes[index];
  if (result.success) {
    console.log(`✓ ${dictName}: ${result.documentCount} documents indexed`);
  } else {
    console.error(`✗ ${dictName}: ${result.error}`);
  }
});