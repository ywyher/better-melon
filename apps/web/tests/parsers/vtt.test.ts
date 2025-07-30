import { parseVtt } from "@/lib/subtitle/parsers/vtt";
import { expect, test } from "bun:test";

test("returns episodes data", async () => {
  const wrongTimestampsFile = "https://megacloudforest.xyz/subtitle/090c09c12a07d5a96f14a2c1841e0548/eng-2.vtt" 
  const normalFile = "https://megacloudforest.xyz/subtitle/2d66adc93c89dd5c0642c8c9c38d4ec8/eng-0.vtt"
  const raw = await fetch(wrongTimestampsFile)

  if(!raw.ok) throw new Error("Failed to fetch content")

  const content = await raw.text()
  const parsed = parseVtt(content, 'english')

  expect(content).not.toBeEmpty()
  expect(parsed).not.toBeEmpty()
});