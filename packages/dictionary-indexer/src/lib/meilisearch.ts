import { MeiliSearch } from "meilisearch";
import { env } from "./env";

export const meili = new MeiliSearch({
  host: env.HOST,
  apiKey: env.API_KEY
})