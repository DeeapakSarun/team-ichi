# UpliftXP

A gamified health and fitness app that helps users track their physical and mental well-being through XP-based rewards and achievements.

## Features

- User authentication with Firebase
- Step counting using device sensors
- Daily health tasks with XP rewards
- Level progression system
- Global leaderboard
- Profile management
- Modern and intuitive UI.

## Tech Stack

- React Native with Expo
- Firebase (Authentication & Firestore)
- React Navigation
- React Native Paper
- Expo Sensors
- AsyncStorage

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Firebase account

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd Upliftxp
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase configuration

4. Configure Firebase:
   - Replace the Firebase configuration in `src/config/firebase.js` with your own configuration

5. Start the development server:
```bash
npm start
```

6. Run on your device:
   - Install the Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or use an emulator (Android/iOS)

## Project Structure

```
Upliftxp/
├── src/
│   ├── screens/         # App screens
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # Business logic and API calls
│   ├── utils/          # Helper functions
│   ├── config/         # Configuration files
│   └── assets/         # Images, fonts, etc.
├── App.js              # Root component
└── package.json        # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
