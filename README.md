# What is it ?
An [Animleon](https://www.animelon.com/) alternative that aims to overcome all animelon's inconvenients

# Why ?
Animelon doesn’t provide all animes by default, and its entries are rarely updated, making it difficult for learners who want to watch modern anime with subtitles. That’s why I decided to create this website—to offer the latest animes with subtitles, along with real-time Japanese subtitle definitions, providing a more feature-rich alternative.

# Roadmap
> [!warning]
> This project is still in beta 

> [!note]
> the only crucial feature that hasn't been added yet is the definition on hover functionality, you could use yomitan instead for now

usable alternative
- [x] Search/Filtering system
- [x] Watch functionality
- [x] Subtitles panel
- [x] Sync video subtitles with the panel subtitles
- [x] Support for all japanese writing system
- [x] Video chapters/timestamps
- [x] Skip chapters/timestamps button
- [x] Interactive video subtitles
- [x] Delay subtitle feature
- [x] Next/Previous cue buttons
- [x] Support local subtitles
- [x] Seperate delay sliders for japanese and english subs
- [ ] Optimize for best performance
- [ ] Episodes selelctor
- [ ] Video vtt thumbnails
- [ ] Providers selector
- [ ] Defintion on hover functionality
- [ ] .ass support
- [ ] Authentication integration through anilist
- [ ] Anki integration
- [ ] User friendly/Modern UI

# Self-Hosting
> [!warning]
> This project is still in beta

> [!note]
> you can access this app without self hosting it via https://better-melon.vercel.app

### Clone the Repository
```sh
git clone https://github.com/ywyher/better-melon ./better-melon
cd ./better-melon
```

### Install Dependencies
Use either `pnpm` or `npm`:
```sh
pnpm i  # or npm i
```

### Run Required Services

#### Using Docker Compose
Run the following command to start the required services:
```sh
docker compose -f docker.yaml up -d
```

#### Running Manually
If you prefer to run the services manually, use the following commands:
```sh
docker run -d \
  --name=consumet-api \
  -p 6969:3000 \
  --restart unless-stopped \
  riimuru/consumet-api

docker run -d \
  --name=m3u8-proxy \
  -p 8080:8080 \
  --restart unless-stopped \
  dovakiin0/m3u8-proxy
```

For more details on hosting the Consumet API on other platforms, refer to the official repo [GitHub repository](https://github.com/consumet/consumet-api).

### Register for Jimaku API (free)
Create an account on [Jimaku.cc](https://jimaku.cc) and generate an API token through the profile page.

### Configure Environment Variables
Create a `.env` file in the root directory and fill the following:
```.env
NEXT_PUBLIC_CONSUMET_URL=
NEXT_PUBLIC_PROXY_URL=
JIMAKU_KEY=
```

it should look something like this
```.env
NEXT_PUBLIC_CONSUMET_URL=http://localhost:6969
NEXT_PUBLIC_PROXY_URL=http://localhost:8080/m3u8-proxy
JIMAKU_KEY=AAAAAasndaund9uhWIJHUSDAIDJamsdkoanmdIAUN
```

### Start the Application
`For development` 
```sh
pnpm run dev  # or npm run dev
```

`For production & actual use`

```sh
pnpm run build  # or npm run build
pnpm start # or npm start
```

# Credit
- [Anilist](https://anilist.co/) -> Used to fetch anime data 
- [Consument](https://github.com/consumet/api.consumet.org) -> Used to fetch anime streaming data
- [Jimaku](https://jimaku.cc/) -> Used to fetch japanese subtitles
- [ywyh (Me)](https://github.com/ywyher) – for being goated