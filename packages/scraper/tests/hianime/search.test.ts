import Hianime from "../../src/hianime";
import { expect, test } from "bun:test";

test("hianime search", async () => {
  const hianime = new Hianime()
  const results = await hianime.search({
    q: 'steins;gate',
    filters: {
      status: 'FINISHED_AIRING',
      language: 'SUB',
      sort: 'MOST_WATCHED',
      type: 'TV',
      genres: ["SCI_FI"],
      start_date: {
        day: 6,
        month: 4,
        year: 2011
      },
      end_date: {
        day: 14,
        month: 9,
        year: 2011
      },
    },
  })

  expect(results).not.toBeEmpty()
});