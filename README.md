# VIBE UNIVERSE

Quest-driven AI hackathon platform where participants restore an abandoned developer's unfinished feature specifications through vibe coding, then trade prompts and invest in teams.

## Overview

VIBE UNIVERSE transforms a static hackathon platform into an interactive game. The core narrative: a developer left behind only analog feature specifications before disappearing. Participants "restore" these analog notes into digital UI components, trade verified prompts in a marketplace, and predict winning teams through an investment system.

All data is managed through localStorage with a 3-slot save system -- no external server required.

## Core Features

### 1. Restoration System
- Hackathon detail pages start as analog-styled placeholders
- Users click to restore each of 7 sections into polished digital UI
- Each restoration rewards +50 Vibe Points (VP)
- Full restoration grants a +200 VP bonus

### 2. Camp (Team Management)
- Create teams with name, description, and open positions
- Join existing teams (updates member count in real-time)
- Prompt workspace for creating reusable prompt templates
- Variable interpolation with \{\{variable\}\} syntax
- One-click clipboard copy of compiled prompts
- Sell prompts directly to the marketplace

### 3. Prompt Market
- Browse and search prompts by category (prompt, component, template)
- Buy prompts with VP (purchased items are added to your collection)
- Sell custom prompts with configurable pricing
- Deep Work mode blocks marketplace purchases

### 4. Arena (1v1 Blind Voting)
- Random matchups between teams with hidden identities
- Vote for the preferred team to earn +5 VP per vote
- Elo rating system (K=32) updates after each match
- Team names revealed after voting
- Dedicated Elo leaderboard view

### 5. Rankings
- Global leaderboard sorted by total Vibe Points
- User's rank calculated dynamically from VP balance
- Investment return and arena win tracking per user

### 6. Multiverse Save Slots
- 3 independent save slots with isolated data
- Switch between slots from the top navigation bar
- Each slot maintains its own user, teams, market items, and progress

### 7. Deep Work Mode
- Automatically activates 24 hours before the nearest hackathon deadline
- Manual toggle available in the navigation bar
- Restricts marketplace access to encourage focus
- Real-time countdown display

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Framer Motion
- TypeScript
- localStorage (no external database)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
npm start
```

The app runs at http://localhost:3000

## Project Structure

```
src/
  app/              # Next.js pages (home, hackathons, camp, market, arena, rankings)
  components/       # Reusable UI components
    layout/         # Navigation, providers, modals
    analog/         # Pre-restoration styled components
    digital/        # Post-restoration styled components
  contexts/         # React contexts (Slot, User, DeepWork)
  lib/              # Utilities (storage, elo, betting, data-init)
  types/            # TypeScript type definitions
public/
  data/             # JSON seed data (hackathons, teams, leaderboard)
```

## VP Reward Table

| Action | Reward |
|---|---|
| Section Restoration | +50 VP |
| Full Restoration Bonus | +200 VP |
| Team Creation | +30 VP |
| Team Join | +20 VP |
| Prompt Registration | +15 VP |
| Market Listing | +10 VP |
| Arena Vote | +5 VP |
| Hackathon Submission | +100 VP |

## Deployment

A `render.yaml` is included for one-click deployment on Render.

## License

MIT
