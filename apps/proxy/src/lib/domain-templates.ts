import { DomainGroup, DomainTemplate } from "../types/domain-templates";

const commonHeaders = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0',
  'accept': '*/*',
  'accept-language': 'en-US,en;q=0.5',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  "sec-fetch-site": "cross-site",
};

const domainGroups: DomainGroup[] = [
  {
    patterns: [/lightningspark77\.pro/i,/thunderwave48\.xyz/i,/stormwatch95\.site/i,/windyrays29\.online/i,/thunderstrike77\.online/i,/lightningflash39\.live/i,/cloudburst82\.xyz/i,/drizzleshower19\.site/i,/rainstorm92\.xyz/i],
    origin: 'https://megacloud.club',
    referer: 'https://megacloud.club/',
  },
  {
    patterns: [/dewbreeze84\.online/i,/mistyvalley31\.live/i,/cloudydrift38\.site/i,/sunshinerays93\.live/i,/sunburst66\.pro/i,/clearbluesky72\.wiki/i,/breezygale56\.online/i,/frostywinds57\.live/i,/icyhailstorm29\.online/i,/windflash93\.xyz/i,/stormdrift27\.site/i,/tempestcloud61\.wiki/i],
    origin: 'https://megacloud.blog',
    referer: 'https://megacloud.blog/',
  },
  {
    patterns: [/frostbite27\.pro/i, /icyhailstorm64\.wiki/i],
    origin: 'https://megacloud.blog',
    referer: 'https://megacloud.blog/',
    additionalHeaders: { 
      'cache-control': 'no-cache',
      'pragma': 'no-cache'
    },
  },
  {
    patterns: [/\.megaup\.cc/i, /\.nebulax-89\.biz/i],
    origin: 'https://megaup.cc',
    referer: 'https://megaup.cc/',
  },
  {
    patterns: [/\.padorupado\.ru/i, /\.kwikie\.ru/i],
    origin: 'https://kwik.si',
    referer: 'https://kwik.si/',
  },
  {
    patterns: [/krussdomi\.com/i,/revolutionizingtheweb\.xyz/i,/nextgentechnologytrends\.xyz/i,/smartinvestmentstrategies\.xyz/i,/creativedesignstudioxyz\.xyz/i,/breakingdigitalboundaries\.xyz/i,/ultimatetechinnovation\.xyz/i],
    origin: 'https://hls.krussdomi.com',
    referer: 'https://hls.krussdomi.com/',
  },
  {
    patterns: [/\.akamaized\.net/i],
    origin: 'https://bl.krussdomi.com',
    referer: 'https://bl.krussdomi.com/',
  },
  {
    patterns: [/\.anih1\.top/i, /\.xyk3\.top/i],
    origin: 'https://ee.anih1.top',
    referer: 'https://ee.anih1.top/',
  },
  {
    patterns: [/\.premilkyway\.com/i],
    origin: 'https://uqloads.xyz',
    referer: 'https://uqloads.xyz/',
  },
  {
    patterns: [/raffaellocdn\.net/i, /clearskydrift45\.site/i, /feetcdn\.com/i, /raffaellocdn\.net/i,],
    origin: 'https://uqloads.xyz',
    referer: 'https://uqloads.xyz/',
  },
  {
    patterns: [/vmeas\.cloud/i,/1stkmgv1\.com/i],
    origin: 'https://vidmoly.to',
    referer: 'https://vidmoly.to/',
  },
  {
    patterns: [/nextwaveinitiative\.xyz/i,/shadowlandschronicles\.com/i],
    origin: 'https://edgedeliverynetwork.org',
    referer: 'https://edgedeliverynetwork.org/',
  },
  {
    patterns: [/lightningbolts\.ru/i,/lightningbolt\.site/i,/vyebzzqlojvrl\.top/i],
    origin: 'https://vidsrc.cc',
    referer: 'https://vidsrc.cc/',
  },
  {
    patterns: [/vidlvod\.store/i],
    origin: 'https://vidlink.pro',
    referer: 'https://vidlink.pro/',
  },
  {
    patterns: [/sunnybreeze16\.live/i],
    origin: 'https://megacloud.store',
    referer: 'https://megacloud.store/',
  },
  {
    patterns: [/heatwave90\.pro/i,/humidmist27\.wiki/i,/frozenbreeze65\.live/i,/drizzlerain73\.online/i,/sunrays81\.xyz/i],
    origin: 'https://kerolaunochan.live',
    referer: 'https://kerolaunochan.live/',
  },
  {
    patterns: [/embed\.su/i,/usbigcdn\.cc/i,/\.congacdn\.cc/i],
    origin: 'https://embed.su',
    referer: 'https://embed.su/',
  },
  {
    patterns: [/\.vkcdn5\.com/i],
    origin: 'https://vkspeed.com',
    referer: 'https://vkspeed.com/',
  },
  {
    patterns: [/\.akamaized\.net/i],
    origin: 'https://players.akamai.com',
    referer: 'https://players.akamai.com/',
    excludeHeaders: ['accept-language']
  },
  {
    patterns: [/\.cloudfront\.net/i],
    origin: 'https://d2zihajmogu5jn.cloudfront.net',
    referer: 'https://d2zihajmogu5jn.cloudfront.net/',
    excludeHeaders: ['accept-language'],
    overrideHeaders: {
      "sec-fetch-site": "same-site"
    }
  },
  {
    patterns: [/\.ttvnw\.net/i],
    origin: 'https://',
    referer: 'https:///',
    excludeHeaders: ['accept-language'],
    overrideHeaders: {
      "sec-fetch-site": "same-site"
    }
  },
  {
    patterns: [/\.xx.fbcdn\.net/i],
    origin: 'https://www.facebook.com',
    referer: 'https://www.facebook.com/',
    excludeHeaders: ['accept-language'],
    overrideHeaders: {
      "sec-fetch-site": "same-site"
    }
  },
  {
    patterns: [/.*/],
    origin: '',
    referer: '',
  },
];

export const domainTemplates: DomainTemplate[] = domainGroups.flatMap((group: DomainGroup) =>
  group.patterns.map(pattern => {
    let headers: Record<string, string> = { ...commonHeaders, origin: group.origin, referer: group.referer };

    if (group.excludeHeaders) {
      group.excludeHeaders.forEach(header => {
        delete headers[header];
      });
    }
    
    if (group.overrideHeaders) {
      headers = { ...headers, ...group.overrideHeaders };
    }
    
    if (group.additionalHeaders) {
      headers = { ...headers, ...group.additionalHeaders };
    }
    
    return {
      pattern,
      headers,
      origin: group.origin,
      referer: group.referer,
    };
  })
);

export function findDomainTemplate(url: string) {
  const template = domainTemplates.find(template => template.pattern.test(url))
  return {
    pattern: template?.pattern,
    headers: template?.headers,
    origin: template?.origin,
    referer: template?.referer,
  };
}