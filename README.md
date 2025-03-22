# UpliftXP - Health & Wellness Gamification App

UpliftXP is a mobile application that gamifies health and wellness activities, helping users maintain both their mental and physical health through a rewarding experience system.

## Features

- User Authentication (Google/Facebook/Email)
- Apple Health Integration
- Daily Health Tasks
- XP Tracking System
- Global Leaderboard
- Habit Tracking

## Tech Stack

- React Native with Expo
- Firebase (Authentication & Database)
- React Native Paper (UI Components)
- TypeScript
- Apple HealthKit Integration

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on iOS:
   ```bash
   npm run ios
   ```

4. Run on Android:
   ```bash
   npm run android
   ```

## Environment Setup

1. Create a `.env` file in the root directory
2. Add the following variables:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── screens/       # Screen components
  ├── contexts/      # React Context providers
  ├── services/      # API and third-party service integrations
  ├── utils/         # Helper functions and utilities
  └── types/         # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 