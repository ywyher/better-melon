import Elysia, { t } from "elysia";
import { findDomainTemplate } from "../lib/domain-templates";
import { processM3u8 } from "../lib/m3u8-handler";

export const proxy = new Elysia({ prefix: "proxy" })
  .get('', async ({ query: { url }, set }) => {
    set.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Type, Accept-Ranges',
      'Content-Type': 'application/vnd.apple.mpegurl'
    };  

    const headers: Record<string, string> = {};
    const { host } = new URL(url);
    const { headers: domainHeaders } = findDomainTemplate(url)
    Object.assign(headers, domainHeaders);
    headers['host'] = host;

    const response = await fetch(url, {
      headers,
    });

    const raw = await response.text();
    const data = processM3u8(raw, url)

    return data
  }, {
    query: t.Object({
      url: t.String({
        format: 'uri'
      })
    })
  })