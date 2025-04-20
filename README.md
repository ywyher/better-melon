> [!note]
> the hosted vercel instance won't always be up-to-date as long as we are in development, Therefore we recommend self-hosting for up-to-date experience

# What is it ?
An [Animleon](https://www.animelon.com/) alternative that aims to overcome all animelon's inconvenients

# Why ?
Animelon doesn’t provide all animes, and its entries are rarely updated, making it difficult for learners who want to watch modern anime with subtitles. That’s why I decided to create this website—to offer the latest animes with subtitles, along with real-time Japanese subtitle definitions, providing a more feature-rich alternative.

# Roadmap
> [!warning]
> This project is still in beta

> [!note]
> The only crucial feature not yet implemented is definition-on-select functionality. You can use Yomitan as an alternative for now.

## Completed Features

### Core Functionality
- Search/Filtering system
- Watch functionality
- Subtitles panel
- Video-subtitle synchronization
- Support for all Japanese writing systems
- Video chapters/timestamps
- Chapter skip buttons
- Interactive video subtitles
- Subtitle delay feature
- Next/Previous cue navigation
- Local subtitle support
- Separate delay sliders for Japanese and English subtitles
- Episodes list/selector

### User Experience
- Subtitles styling options
- Customizable transcription order
- Player settings synchronization with database

### Integrations
- Authentication via better-auth
- Account linking 
  1. Anilist
- Anki integration
  1. Image support

### User Data Management
  - Anonymous user profiles
  - Settings preserved after registration
  - Unified storage implementation

### Settings Categories
- General preferences
- Player configuration
- Connection/account management
- Anki integration settings

## Planned Features
- Add to list
- Audio support for anki
- Video VTT thumbnails
- Providers selector
- Definition-on-select functionality
- .ass subtitle support
- User-friendly/modern UI redesign

# Better Melon Self-Hosting Guide
> [!warning]
> This project is still in beta

> [!note]
> You can access this app without self-hosting via https://better-melon.vercel.app

## Quick Start

### 1. Clone the Repository
```sh
git clone https://github.com/ywyher/better-melon ./better-melon
cd ./better-melon
```

### 2. Install Dependencies
```sh
pnpm i  # or npm i
```

### 3. Set Up Required Services
You need the following:
- PostgreSQL database
- M3U8 proxy server
- Consumet API


**Option A: Using Docker Compose**
```sh
docker compose -f docker.yaml up -d
```

**Option B: Running Services Individually**
```sh
# Start Consumet API
docker run -d \
  --name=consumet-api \
  -p 6969:3000 \
  --restart unless-stopped \
  riimuru/consumet-api

# Start M3U8 Proxy
docker run -d \
  --name=m3u8-proxy \
  -p 8080:8080 \
  --restart unless-stopped \
  dovakiin0/m3u8-proxy

# Start PostgreSQL
docker run -d \
  --name=postgres \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres
```

### 4. Register for External Services
- Create an account on [Jimaku.cc](https://jimaku.cc) and generate an API token
- Set up AniList API credentials at [anilist.co/settings/developer](https://anilist.co/settings/developer)
- Register for [Resend](https://resend.com/) for email functionality

### 5. Configure Environment Variables
Create a `.env` file in the root directory with the following:

```env
APP_URL=http://localhost:3000
ENV=DEVELOPMENT  # or PRODUCTION
DATABASE_URL=postgres://postgres:postgres@localhost:5432/better-melon

BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_secret_key_here

CONSUMET_URL=http://localhost:6969
JIMAKU_KEY=your_jimaku_api_key

NEXT_PUBLIC_PROXY_URL=http://localhost:8080
NEXT_PUBLIC_ANKI_CONNECT_URL=http://localhost:8765

ANILIST_ID=your_anilist_id
ANILIST_SECRET=your_anilist_secret
ANILIST_REDIRECT_URL=http://localhost:3000/api/auth/oauth2/callback/anilist

RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_API_KEY=your_resend_api_key
```

### 6. Initialize Database and Start the Application

**For Development:**
```sh
npx drizzle-kit push
pnpm run dev  # or npm run dev
```

**For Production:**
```sh
npx drizzle-kit push
pnpm run build  # or npm run build
pnpm start  # or npm start
```

# Credit
- [Anilist](https://anilist.co/) -> Used to fetch anime data 
- [Consument](https://github.com/consumet/api.consumet.org) -> Used to fetch anime streaming data
- [Jimaku](https://jimaku.cc/) -> Used to fetch japanese subtitles
- [itzzzme](https://github.com/itzzzme/m3u8proxy) -> For the proxy <3
- [ywyh (Me)](https://github.com/ywyher) – for being goated