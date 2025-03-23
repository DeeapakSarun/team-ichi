import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
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

const TaskItem = ({ task, completed, onToggle, isPenalty = false }) => (
  <Card style={[styles.taskCard, isPenalty && styles.penaltyTaskCard]}>
    <Card.Content>
      <View style={styles.taskRow}>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, isPenalty && styles.penaltyTaskTitle]}>
            {task.title} {isPenalty && '⚠️'}
          </Text>
          <Text style={[styles.xpText, isPenalty && styles.penaltyXpText]}>
            +{task.xp} XP {isPenalty && '(Penalty)'}
          </Text>
        </View>
        <Checkbox
          status={completed ? 'checked' : 'unchecked'}
          onPress={onToggle}
          color={isPenalty ? '#d32f2f' : '#000'}
        />
      </View>
    </Card.Content>
  </Card>
);

const TasksScreen = () => {
  const { userData, loading: userLoading, updateUserData } = useUser();
  const [dailyTasks, setDailyTasks] = useState([]);
  const [penaltyTasks, setPenaltyTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [completedPenaltyTasks, setCompletedPenaltyTasks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const today = new Date().toISOString().split('T')[0];
        const lastTaskDate = data.lastTaskDate || today;

        // If it's a new day, refresh tasks
        if (lastTaskDate !== today) {
          const shuffled = [...allDailyTasks].sort(() => 0.5 - Math.random());
          const newDailyTasks = shuffled.slice(0, 3);
          
          // Update Firestore with new tasks, but keep existing penalty tasks
          await updateDoc(userRef, {
            lastTaskDate: today,
            dailyTasks: newDailyTasks,
            completedTasks: {},
          });

          // Update local state with new tasks
          setDailyTasks(newDailyTasks);
          // Keep existing penalties (they're already filtered to active ones)
          setPenaltyTasks(data.penaltyTasks || []);
          setCompletedPenaltyTasks({});
          setCompletedTasks({});
        } else {
          // Load existing tasks
          setDailyTasks(data.dailyTasks || []);
          // Only show penalty tasks that aren't completed
          setPenaltyTasks(data.penaltyTasks || []);
          setCompletedTasks(data.completedTasks || {});
          setCompletedPenaltyTasks(data.completedPenaltyTasks || {});
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Function to enhance task titles for penalty tasks
  const enhanceTaskTitle = (title) => {
    const enhancements = {
      '💧 Drink 8 glasses of water': '💧 Drink 12 glasses of water',
      '🏃‍♂️ Exercise for 30 minutes': '🏃‍♂️ Exercise for 60 minutes',
      '🧘‍♂️ Meditate for 10 minutes': '🧘‍♂️ Meditate for 30 minutes',
      '📚 Read for 30 minutes': '📚 Read for 60 minutes',
      '😴 Get 8 hours of sleep': '😴 Get 9 hours of sleep',
      '🥗 Eat a healthy meal': '🥗 Eat 2 healthy meals',
      '🙏 Write 3 things you\'re grateful for': '🙏 Write 5 things you\'re grateful for',
      '🚶‍♂️ Take a 15-minute walk': '🚶‍♂️ Take a 30-minute walk',
      '🤸‍♂️ Do stretching exercises': '🤸‍♂️ Do 30 minutes of stretching exercises',
      '📝 Write in your journal': '📝 Write 2 pages in your journal',
      '💊 Take your vitamins': '💊 Take your vitamins and drink extra water',
      '🧹 Clean your space': '🧹 Deep clean your entire space',
    };
    return enhancements[title] || title;
  };

  // Add effect to reload tasks when userData changes
  useEffect(() => {
    if (userData?.lastTaskDate) {
      loadTasks();
    }
  }, [userData?.lastTaskDate]);

  const handleTaskCompletion = async (taskId, isCompleted, isPenalty = false) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const task = isPenalty 
          ? penaltyTasks.find(t => t.id === taskId)
          : dailyTasks.find(t => t.id === taskId);

        if (!task) return;

        // For regular tasks just update completion status
        if (!isPenalty) {
          const newCompletedTasks = { 
            ...completedTasks, 
            [taskId]: isCompleted 
          };
          
          // Calculate XP gain
          const xpChange = isCompleted ? task.xp : -task.xp;
          const currentXP = data.xp || 0;
          const newXP = Math.max(0, currentXP + xpChange);
          
          // Update Firestore
          await updateDoc(userRef, {
            completedTasks: newCompletedTasks,
            xp: newXP,
          });
          
          // Update local state
          setCompletedTasks(newCompletedTasks);
          updateUserData({ xp: newXP });
        } 
        // For penalty tasks, if completed remove them entirely
        else if (isCompleted) {
          // Calculate XP gain
          const xpChange = task.xp;
          const currentXP = data.xp || 0;
          const newXP = currentXP + xpChange;
          
          // Remove the completed penalty task
          const updatedPenaltyTasks = data.penaltyTasks.filter(
            penaltyTask => penaltyTask.id !== taskId
          );
          
          // Update Firestore
          await updateDoc(userRef, {
            penaltyTasks: updatedPenaltyTasks,
            xp: newXP,
          });
          
          // Update local state
          setPenaltyTasks(updatedPenaltyTasks);
          updateUserData({ xp: newXP });
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
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  // Check if all daily tasks are completed - hide penalty section if so
  const allTasksCompleted = dailyTasks.length > 0 && 
    dailyTasks.every(task => completedTasks[task.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.header}>
          <Text style={styles.headerTitle}>Daily Tasks</Text>
          <Text style={styles.headerSubtitle}>Complete tasks to earn XP and maintain your streak!</Text>
        </Surface>

        {/* Daily Tasks Section */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(Object.keys(completedTasks).length / dailyTasks.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Object.keys(completedTasks).length}/{dailyTasks.length} tasks completed
            </Text>
          </View>
          {dailyTasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <Card.Content>
                <View style={styles.taskContent}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskXp}>+{task.xp} XP</Text>
                  </View>
                  <Checkbox
                    status={completedTasks[task.id] ? 'checked' : 'unchecked'}
                    onPress={() => handleTaskCompletion(task.id, !completedTasks[task.id])}
                    color="#4CAF50"
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
        </Surface>

        {/* Penalty Tasks Section - Only show if there are active penalty tasks AND not all daily tasks are completed */}
        {penaltyTasks.length > 0 && 
          !(dailyTasks.length > 0 && dailyTasks.every(task => completedTasks[task.id])) && (
          <Surface style={[styles.section, styles.penaltySection]}>
            <Text style={styles.sectionTitle}>Penalty Tasks</Text>
            <Text style={styles.penaltySubtitle}>Complete these tasks to make up for missed daily tasks</Text>
            {penaltyTasks.map((task) => (
              <Card key={task.id} style={[styles.taskCard, styles.penaltyCard]}>
                <Card.Content>
                  <View style={styles.taskContent}>
                    <View style={styles.taskInfo}>
                      <Text style={styles.penaltyTaskTitle}>⚠️ {task.title}</Text>
                      <Text style={styles.penaltyTaskXp}>+{task.xp} XP (Double)</Text>
                    </View>
                    <Checkbox
                      status={completedPenaltyTasks[task.id] ? 'checked' : 'unchecked'}
                      onPress={() => handleTaskCompletion(task.id, !completedPenaltyTasks[task.id], true)}
                      color="#FF5252"
                    />
                  </View>
                </Card.Content>
              </Card>
            ))}
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  penaltySection: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffebee',
    marginTop: 16,
  },
  penaltySubtitle: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  penaltyCard: {
    backgroundColor: '#fff',
    borderColor: '#ffebee',
  },
  penaltyTaskTitle: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '500',
  },
  penaltyTaskXp: {
    fontSize: 14,
    color: '#d32f2f',
    marginTop: 4,
  },
  taskCard: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  penaltyTaskCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffebee',
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  xpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  penaltyXpText: {
    color: '#d32f2f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default TasksScreen;