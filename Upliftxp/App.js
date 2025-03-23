import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <PaperProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </PaperProvider>
  );
}
