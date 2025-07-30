import { MeiliSearch } from "meilisearch";
import { env } from "./env";

export const meili = new MeiliSearch({
  host: env.MEILISEARCH_URL,
  apiKey: env.MEILISEARCH_API_KEY,
})