# Advanplux - Earn Money Watching Ads

A modern web platform where users can earn money by watching ads, referring friends, and building teams.

## Features

- 🎥 **Watch Ads & Earn** - Simple ad watching interface with instant earnings
- 👥 **Referral System** - Earn bonuses when friends sign up using your referral link
- 🏆 **Team Earnings** - Build your team and unlock tier-based bonuses
- 🎯 **Activities** - Daily challenges, leaderboards, rewards store, and more
- 📱 **Responsive Design** - Beautiful, modern UI that works on all devices

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Modern ES6+ JavaScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx      # Navigation bar
│   ├── Hero.jsx        # Hero section
│   ├── AdWatching.jsx  # Ad watching section
│   ├── Referral.jsx    # Referral system
│   ├── TeamEarning.jsx # Team earnings section
│   ├── Activities.jsx  # Additional activities
│   └── Footer.jsx      # Footer section
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles with Tailwind
```

## Notes

- This is currently a frontend-only implementation with UI components
- Backend integration and actual earning functionality would need to be implemented separately
- All earning amounts and statistics shown are placeholder values
