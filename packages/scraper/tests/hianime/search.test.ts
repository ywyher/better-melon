import Hianime from "../../src/hianime";
import { expect, test } from "bun:test";

test("hianime search", async () => {
  const hianime = new Hianime()
  const results = await hianime.search({
    q: 'steins;gate',
    filters: {
      status: 'FINISHED',
      language: 'SUB',
      sort: 'MOST_WATCHED',
      format: 'TV',
      genres: ["SCI_FI"],
      startDate: {
        day: 6,
        month: 4,
        year: 2011
      },
      endDate: {
        day: 14,
        month: 9,
        year: 2011
      },
    },
  })

  expect(results).not.toBeEmpty()
});