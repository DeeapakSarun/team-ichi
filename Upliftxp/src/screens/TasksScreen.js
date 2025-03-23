import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, Surface, Button, Card, Checkbox, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from '../services/authService';
import { useUser } from '../context/UserContext';

const allDailyTasks = [
  { id: 'water', title: '💧 Drink 8 glasses of water', xp: 20 },
  { id: 'exercise', title: '🏃‍♂️ Exercise for 30 minutes', xp: 30 },
  { id: 'meditation', title: '🧘‍♂️ Meditate for 10 minutes', xp: 20 },
  { id: 'reading', title: '📚 Read for 30 minutes', xp: 25 },
  { id: 'sleep', title: '😴 Get 8 hours of sleep', xp: 25 },
  { id: 'healthy_meal', title: '🥗 Eat a healthy meal', xp: 20 },
  { id: 'gratitude', title: '🙏 Write 3 things you\'re grateful for', xp: 15 },
  { id: 'walk', title: '🚶‍♂️ Take a 15-minute walk', xp: 20 },
  { id: 'stretch', title: '🤸‍♂️ Do stretching exercises', xp: 15 },
  { id: 'journal', title: '📝 Write in your journal', xp: 20 },
  { id: 'vitamins', title: '💊 Take your vitamins', xp: 10 },
  { id: 'clean', title: '🧹 Clean your space', xp: 20 },
];

const TasksScreen = () => {
  const { userData, updateUserData } = useUser();
  const [dailyTasks, setDailyTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const lastTaskDate = data.lastTaskDate || '2000-01-01';
          const today = new Date().toISOString().split('T')[0];

          // Only refresh tasks if:
          // 1. It's a new day (lastTaskDate !== today)
          // 2. OR there are no daily tasks
          // 3. OR the date was manually changed in developer mode
          if (lastTaskDate !== today || !data.dailyTasks || data.dailyTasks.length === 0) {
            // Generate new random tasks
            const shuffled = [...allDailyTasks].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);
            
            // Update Firestore with new tasks
            await updateDoc(doc(db, 'users', user.uid), {
              dailyTasks: selected,
              lastTaskDate: today,
              completedTasks: {},
            });

            // Update local state
            setDailyTasks(selected);
            setCompletedTasks({});
          } else {
            // Use existing tasks
            setDailyTasks(data.dailyTasks || []);
            setCompletedTasks(data.completedTasks || {});
          }
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Add effect to reload tasks when userData changes
  useEffect(() => {
    if (userData?.lastTaskDate) {
      loadTasks();
    }
  }, [userData?.lastTaskDate]);

  const handleTaskCompletion = async (taskId, isCompleted) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const newCompletedTasks = {
          ...completedTasks,
          [taskId]: isCompleted,
        };

        // Calculate XP gain
        const task = dailyTasks.find(t => t.id === taskId);
        const xpChange = isCompleted ? task.xp : -task.xp;
        const currentXP = data.xp || 0;
        const newXP = Math.max(0, currentXP + xpChange);

        // Check if all tasks are completed
        const allTasksCompleted = Object.values(newCompletedTasks).every(Boolean) && 
                                Object.keys(newCompletedTasks).length === dailyTasks.length;
        
        // Get current streak and last streak date
        const currentStreak = data.streak || 0;
        const lastStreakDate = data.lastStreakDate || '2000-01-01';
        const today = new Date().toISOString().split('T')[0];

        // Update streak if all tasks are completed and it's a new day
        let streakUpdate = {};
        if (allTasksCompleted && lastStreakDate !== today) {
          streakUpdate = {
            streak: currentStreak + 1,
            lastStreakDate: today
          };
        }

        // Update Firestore with all changes
        await updateDoc(userRef, {
          completedTasks: newCompletedTasks,
          xp: newXP,
          ...streakUpdate
        });

        // Update local state
        setCompletedTasks(newCompletedTasks);
        
        // Update user context with all changes
        updateUserData({
          xp: newXP,
          ...streakUpdate
        });

        // Show streak increase notification
        if (allTasksCompleted && lastStreakDate !== today) {
          Alert.alert(
            'Streak Increased! 🔥',
            `Congratulations! Your streak is now ${currentStreak + 1} days!`
          );
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.header}>
          <Text style={styles.title}>Daily Tasks</Text>
          <Text style={styles.subtitle}>Complete tasks to earn XP! 🌟</Text>
        </Surface>

        {dailyTasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <Card.Content>
              <View style={styles.taskRow}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.xpText}>+{task.xp} XP</Text>
                </View>
                <Checkbox
                  status={completedTasks[task.id] ? 'checked' : 'unchecked'}
                  onPress={() => handleTaskCompletion(task.id, !completedTasks[task.id])}
                />
              </View>
            </Card.Content>
          </Card>
        ))}

        <Surface style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Daily Progress: {Object.values(completedTasks).filter(Boolean).length}/{dailyTasks.length}
          </Text>
          <ProgressBar
            progress={dailyTasks.length > 0 ? Object.values(completedTasks).filter(Boolean).length / dailyTasks.length : 0}
            color="#000"
            style={styles.progressBar}
          />
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  taskCard: {
    margin: 16,
    marginTop: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
    marginRight: 16,
  },
  taskTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  xpText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});

export default TasksScreen; 