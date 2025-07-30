# What is it ?
An API made to fetch required data to run [Better Melon](https://github.com/ywyher/better-melon)

# Supported features
- Support anime providers
  - hianime
- Anime general data
- Japanese subtitle files
- Anime streaming data
  - Streaming links
  - English subtitle files
- Japanese dictionary
  - jmdict
  - kanjidic2
  - jmnedict
  - nhk (pitch)

# Better Melon Api Self-Hosting Guide
> [!note]
> this API utilizes [bun](https://bun.sh) make sure you have that installed

## Quick Start

### 1. Clone the project
```sh
git clone https://github.com/ywyher/better-melon-api ./better-melon-api
cd ./better-melon-api
```

### 2. Run required services
- Create an account on [Jimaku.cc](https://jimaku.cc) and generate an API token
- Set up AniList API credentials at [anilist.co/settings/developer](https://anilist.co/settings/developer)

### 3. Setup enviroment variables
```.env
PORT=6969

ANILIST_API_URL=https://graphql.anilist.co/
KITSU_API_URL=https://kitsu.io/api/edge/

JIMAKU_KEY=
JIMAKU_URL=https://jimaku.cc
```

### 4. Install dependencies and start the API
```sh
bun i && bun dev
```

# Credit
- [Better Melon](https://github.com/ywyher/better-melon) -> what is the purpose of better-melon-api without better-melon am i right ??
- [Anilist](https://anilist.co/) -> Used to fetch anime general data
- [Jimaku](https://jimaku.cc/) -> Used to fetch japanese subtitles
- [Aniwatch](https://github.com/ghoshRitesh12/aniwatch) -> Used to fetch anime streaming data
- [ywyh (Me)](https://github.com/ywyher) – for being goated ig