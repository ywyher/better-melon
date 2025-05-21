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
- Subtitles styling options
- Customizable transcription order
- Player settings synchronization with database
- Authentication via better-auth
- Account linking 
  1. Anilist
- Anki integration
  1. Image support
- Anonymous user profiles
- Settings preserved after registration
- Unified storage implementation
- General preferences
- Player configuration
- Connection/account management
- Anki integration settings
- Add to list
- Screenshot
- Copy subtitle text
- Pause at each subtitle
  1. Unpause duration -> duration before the player unpauses it self
- Definition on select or hover setting

## Planned Features
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

**Option A: Using Docker Compose**
```sh
docker compose -f docker.yaml up -d
```

**Option B: Running Services Manually**
```sh
# Start PostgreSQL
docker run -d \
  --name=postgres \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres
```

### 4. Register for External Services
- Setup better-melon-mapper by following the steps shown [here](https://github.com/ywyher/better-melon-mapper)
- Setup shinra proxy by following the steps shown [here](https://github.com/xciphertv/shrina-proxy)
- Set up AniList API credentials at [anilist.co/settings/developer](https://anilist.co/settings/developer)
- Register for [Resend](https://resend.com/) for email functionality

### 5. Configure Environment Variables
Create a `.env` file in the root directory with the following:

```env
APP_URL=http://localhost:3000
ENV=DEVELOPMENT  # or PRODUCTION
DATABASE_URL=postgres://postgres:postgres@localhost:5432/better-melon

NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_secret_key_here

MAPPER_URL=http://localhost:6969/api

NEXT_PUBLIC_PROXY_URL=http://localhost:8080/proxy
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
- [Anilist](https://anilist.co/) -> Used to fetch anime general data
- [Ciphertv](https://github.com/xciphertv/shrina-proxy) -> For the proxy <3
- [Better Auth](https://better-auth.com/) -> Simply the best auth library out there
- [Better Melon Mapper](https://github.com/ywyher/better-melon-mapper) -> our own mapper lol
- [ywyh (Me)](https://github.com/ywyher) – for being goated ig