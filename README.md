# Navigation Dashboard

A password-protected navigation dashboard for managing and accessing multiple websites, built with Node.js and deployed on Vercel with PostgreSQL storage.

## Features

- Clean, responsive dashboard interface
- Add/delete websites via password-protected settings
- Data stored in PostgreSQL database
- One-click access to saved websites

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Set these in your Vercel project settings:

- `DATABASE_URL` - Your PostgreSQL connection string (Neon, Supabase, or Vercel Postgres)
- `ADMIN_PASSWORD` - Password to access settings

### 3. Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Database Setup

The app automatically creates the required `websites` table on first run. Just ensure your `DATABASE_URL` environment variable is set correctly.

## Usage

1. Visit your deployed app
2. Click the Settings button (⚙️)
3. Enter your admin password
4. Add websites with name and URL
5. Click any website card to open it in a new tab

## Local Development

```bash
# Create .env file with your credentials
cp .env.example .env

# Install dependencies
npm install

# Note: For local dev, you'll need to set up a local server
# The app is designed to run on Vercel's serverless functions
```
