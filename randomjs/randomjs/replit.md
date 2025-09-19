# Discord Bot Project

## Overview
This is a Discord bot project built with Node.js and discord.js v14. The bot is designed to connect to Discord servers and can be extended with additional functionality.

## Recent Changes (September 15, 2025)
- Set up project for Replit environment
- Updated discord.js from v13 to v14 syntax (GatewayIntentBits instead of Intents)
- Configured environment variable authentication using DISCORD_BOT_TOKEN
- Created package.json with discord.js v14.22.1 dependency
- Set up Discord Bot workflow to run continuously

## Project Architecture
- **index.js**: Main bot entry point with Discord client setup
- **package.json**: Node.js dependencies and scripts
- **Workflow**: "Discord Bot" - runs `node index.js` in console mode

## User Preferences
- Uses environment variables for secure token storage
- Console-based bot output for monitoring
- Discord.js v14 for latest features and security

## Dependencies
- Node.js 20
- discord.js ^14.22.1

## Current State
The bot is fully functional and running with 15 slash commands:

**Moderation Commands (5):**
- `/kick` - Remove members from server
- `/ban` - Permanently ban members
- `/timeout` - Temporarily mute members  
- `/warn` - Issue warnings to members
- `/clear` - Bulk delete messages

**Interactive Games (4):**
- `/blackjack` - Full card game with hit/stand buttons
- `/rps` - Rock Paper Scissors with interactive buttons
- `/count` - Server-wide counting game with leaderboards
- `/guess` - Number guessing game with smart button layouts

**Fun Commands (6):**
- `/8ball` - Magic 8-ball responses
- `/roll` - Dice rolling with custom options
- `/coinflip` - Coin flip results
- `/joke` - Random jokes
- `/random` - Random facts and numbers
- `/devbadge` - Active Developer Badge helper

The bot includes proper permission checks, error handling, organized command structure, and interactive button functionality for engaging gameplay.