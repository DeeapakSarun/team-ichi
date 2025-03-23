import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Text, Surface, Card, Button, List, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCurrentUser } from '../services/authService';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const TasksScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.uid);
        loadTasks();
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  const loadTasks = async () => {
    // In a real app, these would come from a backend
    const defaultTasks = [
      {
        id: 'walk',
        title: 'Walk 10,000 steps',
        description: 'Take a walk and reach your daily step goal',
        xp: 100,
        icon: 'walk',
        completed: false,
      },
      {
        id: 'meditate',
        title: 'Meditate for 10 minutes',
        description: 'Practice mindfulness and meditation',
        xp: 50,
        icon: 'meditation',
        completed: false,
      },
      {
        id: 'water',
        title: 'Drink 8 glasses of water',
        description: 'Stay hydrated throughout the day',
        xp: 30,
        icon: 'water',
        completed: false,
      },
      {
        id: 'sleep',
        title: 'Get 8 hours of sleep',
        description: 'Maintain a healthy sleep schedule',
        xp: 80,
        icon: 'sleep',
        completed: false,
      },
      {
        id: 'exercise',
        title: '30 minutes of exercise',
        description: 'Do any form of physical activity',
        xp: 120,
        icon: 'run',
        completed: false,
      },
    ];
    setTasks(defaultTasks);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, []);

  const handleTaskComplete = async (taskId) => {
    try {
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const task = tasks.find(t => t.id === taskId);
        
        if (task && !task.completed) {
          const newXp = userData.xp + task.xp;
          const newLevel = Math.floor(newXp / 1000) + 1;
          const newNextLevelXp = newLevel * 1000;

          await updateDoc(userRef, {
            xp: newXp,
            level: newLevel,
            nextLevelXp: newNextLevelXp,
            totalTasksCompleted: (userData.totalTasksCompleted || 0) + 1,
          });

          setTasks(tasks.map(t => 
            t.id === taskId ? { ...t, completed: true } : t
          ));
        }
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
        <View style={styles.header}>
          <Text style={styles.title}>Daily Tasks</Text>
          <Text style={styles.subtitle}>Complete tasks to earn XP</Text>
        </View>

        {tasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <Card.Content>
              <View style={styles.taskHeader}>
                <View style={styles.taskIcon}>
                  <MaterialCommunityIcons name={task.icon} size={24} color="#000" />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                </View>
                <View style={styles.taskReward}>
                  <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                  <Text style={styles.xpText}>+{task.xp} XP</Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => handleTaskComplete(task.id)}
                style={[
                  styles.completeButton,
                  task.completed && styles.completedButton
                ]}
                disabled={task.completed}
              >
                {task.completed ? 'Completed' : 'Complete'}
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  taskCard: {
    margin: 16,
    marginTop: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  taskReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  xpText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#000',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
});

export default TasksScreen; 