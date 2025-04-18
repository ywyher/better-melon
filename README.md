# What is it ?
An [Animleon](https://www.animelon.com/) alternative that aims to overcome all animelon's inconvenients

# Why ?
Animelon doesn’t provide all animes by default, and its entries are rarely updated, making it difficult for learners who want to watch modern anime with subtitles. That’s why I decided to create this website—to offer the latest animes with subtitles, along with real-time Japanese subtitle definitions, providing a more feature-rich alternative.

# Roadmap
> [!warning]
> This project is still in beta 

> [!note]
> the only crucial feature that hasn't been added yet is the definition on select functionality, you could use yomitan instead for now

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
- [x] Episodes list/selector
- [x] Authentication integration using better-auth 
- [x] Account linking
  1. [x] Anilist -> User can link anilist account to perform actions on his list
  2. [ ] Myanimelist -> might not happen cause of term of use
- [x] Anki integration
  1. [x] Support for images
  2. [ ] Support for audio
- [x] Anonymous users -> instead of using localstorage we will create an anonymous record in the database which have the following benifits:
  1. All users settings before registration will be saved into his account after registration (Amazing UX)
  2. I won't have to implement the storing logic twice once for the DB and once for the localstorage each time i need it (Amazing DX lol)
- [x] Subtitles settings (font and and stuff)
- [ ] Global configuration for
  1. [ ] Preferred subtitles formats
  2. [ ] Keyword (regex) when found on a subtitle name select it over the others
- [ ] Per anime configuration for
  1. [ ] Subtitles delay
  2. [ ] Preferred subtitles formats
  3. [ ] Keyword (regex) when found on a subtitle name select it over the others
- [ ] The ability to change transcriptions order
- [ ] Video vtt thumbnails
- [ ] Providers selector
- [ ] Defintion on select functionality
- [ ] .ass support
- [ ] User friendly/Modern UI
-----
probably wont happen:
- [ ] public account page for each account where users can inspect the user account public data
  1. [ ] the option to choose the data you wanna make public/private
- [ ] Comments (maybe lol)

# Self-Hosting
> [!warning]
> This section is outdated

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
CONSUMET_URL=
JIMAKU_KEY=
NEXT_PUBLIC_PROXY_URL=
NEXT_PUBLIC_ANKI_CONNECT_URL=
```

it should look something like this
```.env
CONSUMET_URL=http://localhost:6969
JIMAKU_KEY=AAAAAasndaund9uhWIJHUSDAIDJamsdkoanmdIAUN
NEXT_PUBLIC_PROXY_URL=http://localhost:8080/m3u8-proxy
NEXT_PUBLIC_ANKI_CONNECT_URL=http://127.0.0.1:8765
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