// qlTZZ0Lrfq9KEyW4ACmLYj51ASQ17oBThf9EbttNkFTIoC79

import { load } from "cheerio"
import ky from "ky"
import { hianimeConfig } from "./config"
import type { ExtractHianimeTokenResults } from "../types/sources";

// export async function getHianimeEpiosdesSourcesFromHianime

type ExtractHianimeTokenProps = {
  baseUrl: string;
  sourceId: string
}

// token could be stored in any of these
// - meta => <meta name="_gg_fb" content="4NYkDXCUAZIhcxX3NhpWsMwq8PLyL4j03JfQaGcS2xO2kVbe">
// - dpi => <div data-dpi="N24p2faqtAaA9orC3kOFYk3KbNeT6viy6SQWcXFu5wdsKfho" style="display:none"></div>
// - nonce empty script => <script nonce="Fm37eSgZNX8e4A49PAeW8SNp3m3Kyu4GFYPWNJRIuqk5lCXb">/* empty nonce script */</script>
// - _is_th: comment => <!-- _is_th:DTeR132PB8ysbXwnR9DE4TYREwxK8vQGRGJ7Uu2XtUOV9Ncn -->
// - window object assignment => window.<key> = { ... }
// - window string assignment => window.<key> = "value";

export async function extractHianimeToken({ 
  baseUrl,
  sourceId
}: ExtractHianimeTokenProps) {
  // https://megacloud.blog/embed-2/v3/e-1/CMBQ9K2xAacW?k=1&autoPlay=0&oa=0&asi=1
  const content = await ky.get(`${baseUrl}/${sourceId}?k=1&autoPlay=0&oa=0&asi=1`, {
    headers: {
      Referer: hianimeConfig.url.base
    }
  }).text()

  const $ = load(content)

  const results: Partial<ExtractHianimeTokenResults> = {};

  // 1. Meta tag
  const meta = $('meta[name="_gg_fb"]').attr('content');
  if (meta) results.meta = meta;

  // 2. Data attribute
  const dpi = $('[data-dpi]').attr('data-dpi');
  if (dpi) results.dpi = dpi;

  // 3. Nonce from empty script
  const nonceScript = $('script[nonce]').filter((i, el) => {
    return $(el).text().includes('empty nonce script');
  }).attr('nonce');
  if (nonceScript) results.nonce = nonceScript;

  // 4. JS string assignment: window.<key> = "value";
  const stringAssignRegex = /window\.(\w+)\s*=\s*["']([\w-]+)["']/g;
  const stringMatches = [...content.matchAll(stringAssignRegex)];
  for (const [_, key, value] of stringMatches) {
    results.string = value;
  }

  // 5. JS object assignment: window.<key> = { ... };
  const objectAssignRegex = /window\.(\w+)\s*=\s*(\{[\s\S]*?\});/g;
  const matches = [...content.matchAll(objectAssignRegex)];
  for (const [_, varName, rawObj] of matches) {
    try {
      const parsedObj = eval('(' + rawObj + ')'); 
      if (parsedObj && typeof parsedObj === 'object') {
        const stringValues = Object.values(parsedObj).filter(val => typeof val === 'string');
        const concatenated = stringValues.join('');
        if (concatenated.length >= 20) {
          results.object = concatenated;
        }
      }
    } catch (e) {
      // Skip invalid object
    }
  }

  // 6. HTML comment: <!-- _is_th:... -->
  $('*').contents().each(function () {
    if (this.type === 'comment') {
      const match = this.data.trim().match(/^_is_th:([\w-]+)$/);
      if (match) {
        results.comment = match?.[1]?.trim();
      }
    }
  });

  const token = Object.values(results)[0];
  return token || null;
}