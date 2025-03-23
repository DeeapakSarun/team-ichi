import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppleHealthKit from 'react-native-health';

const HomeScreen = () => {
  const [steps, setSteps] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    // Request HealthKit permissions
    const options = {
      permissions: {
        read: [AppleHealthKit.Constants.Permissions.Steps],
      },
    };

    AppleHealthKit.initHealthKit(options, (error) => {
      if (error) {
        console.log('Error initializing HealthKit:', error);
      } else {
        fetchSteps();
      }
    });
  }, []);

  const fetchSteps = () => {
    const options = {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      endDate: new Date().toISOString(),
    };

    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        console.log('Error fetching steps:', err);
      } else {
        setSteps(results.value);
        // Calculate progress towards daily goal (10,000 steps)
        setDailyProgress(Math.min(results.value / 10000, 1));
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.xpText}>XP: {xp}</Text>
        </View>

        <Card style={styles.stepsCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Today's Steps</Text>
            <Text style={styles.stepsCount}>{steps}</Text>
            <Text style={styles.stepsGoal}>Goal: 10,000 steps</Text>
            <ProgressBar
              progress={dailyProgress}
              color="#6200ee"
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        <Card style={styles.tasksCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Daily Tasks</Text>
            <View style={styles.taskItem}>
              <Text>Complete meditation (10 XP)</Text>
              <Button mode="contained" onPress={() => {}}>Complete</Button>
            </View>
            <View style={styles.taskItem}>
              <Text>Drink 8 glasses of water (5 XP)</Text>
              <Button mode="contained" onPress={() => {}}>Complete</Button>
            </View>
            <View style={styles.taskItem}>
              <Text>30 minutes of exercise (15 XP)</Text>
              <Button mode="contained" onPress={() => {}}>Complete</Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 18,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  stepsCard: {
    margin: 16,
  },
  tasksCard: {
    margin: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stepsCount: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  stepsGoal: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default HomeScreen; 