import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Welcome back!</Title>
          <Paragraph>Your XP: 1000</Paragraph>
          <Paragraph>Daily Steps: 5,000</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Tasks')}
          style={styles.button}
        >
          Daily Tasks
        </Button>
        
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Leaderboard')}
          style={styles.button}
        >
          Leaderboard
        </Button>

        <Button
          mode="outlined"
          onPress={signOut}
          style={styles.button}
        >
          Sign Out
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    marginVertical: 5,
  },
});

export default HomeScreen; 