import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Text, Surface, ProgressBar, Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { stepService } from '../services/stepService';
import { getCurrentUser, getUserProfile } from '../services/authService';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [steps, setSteps] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelXp, setNextLevelXp] = useState(1000);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    initializeUser();
    return () => {
      stepService.stopTracking();
    };
  }, []);

  const initializeUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.uid);
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setXp(userProfile.xp);
          setLevel(userProfile.level);
          setNextLevelXp(userProfile.nextLevelXp || 1000);
        }
        stepService.startTracking(user.uid);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (userId) {
        const userProfile = await getUserProfile(userId);
        if (userProfile) {
          setXp(userProfile.xp);
          setLevel(userProfile.level);
          setNextLevelXp(userProfile.nextLevelXp || 1000);
          setSteps(userProfile.dailySteps || 0);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const calculateProgress = () => {
    return xp / nextLevelXp;
  };

  const handleTaskComplete = async (taskId, xpReward) => {
    try {
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const newXp = userData.xp + xpReward;
        const newLevel = Math.floor(newXp / 1000) + 1;
        const newNextLevelXp = newLevel * 1000;

        await updateDoc(userRef, {
          xp: newXp,
          level: newLevel,
          nextLevelXp: newNextLevelXp,
          totalTasksCompleted: (userData.totalTasksCompleted || 0) + 1,
        });

        setXp(newXp);
        setLevel(newLevel);
        setNextLevelXp(newNextLevelXp);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* XP Progress Section */}
        <Surface style={styles.xpContainer}>
          <View style={styles.xpHeader}>
            <Text style={styles.levelText}>Level {level}</Text>
            <Text style={styles.xpText}>{xp} / {nextLevelXp} XP</Text>
          </View>
          <ProgressBar
            progress={calculateProgress()}
            color="#000"
            style={styles.progressBar}
          />
        </Surface>

        {/* Daily Stats Section */}
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsRow}>
                <MaterialCommunityIcons name="walk" size={24} color="#000" />
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsValue}>{steps}</Text>
                  <Text style={styles.statsLabel}>Steps Today</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsRow}>
                <MaterialCommunityIcons name="star" size={24} color="#000" />
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsValue}>{xp}</Text>
                  <Text style={styles.statsLabel}>XP Earned</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Daily Tasks Section */}
        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>Daily Tasks</Text>
          <Card style={styles.taskCard}>
            <Card.Content>
              <View style={styles.taskRow}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Walk 10,000 steps</Text>
                  <Text style={styles.taskReward}>+100 XP</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleTaskComplete('walk', 100)}
                  style={styles.taskButton}
                >
                  Complete
                </Button>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.taskCard}>
            <Card.Content>
              <View style={styles.taskRow}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Meditate for 10 minutes</Text>
                  <Text style={styles.taskReward}>+50 XP</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleTaskComplete('meditate', 50)}
                  style={styles.taskButton}
                >
                  Complete
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  xpContainer: {
    padding: 20,
    margin: 16,
    borderRadius: 10,
    elevation: 4,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 16,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTextContainer: {
    marginLeft: 12,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  tasksContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  taskReward: {
    fontSize: 14,
    color: '#666',
  },
  taskButton: {
    backgroundColor: '#000',
  },
});

export default HomeScreen; 