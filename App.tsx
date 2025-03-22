import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import { AuthProvider } from './src/contexts/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Auth">
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
} 