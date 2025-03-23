import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, List, Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const TasksScreen = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Complete meditation',
      description: 'Meditate for 10 minutes',
      xp: 10,
      completed: false,
      category: 'Mental Health',
    },
    {
      id: 2,
      title: 'Drink water',
      description: 'Drink 8 glasses of water',
      xp: 5,
      completed: false,
      category: 'Physical Health',
    },
    {
      id: 3,
      title: 'Exercise',
      description: '30 minutes of physical activity',
      xp: 15,
      completed: false,
      category: 'Physical Health',
    },
    {
      id: 4,
      title: 'Read a book',
      description: 'Read for 20 minutes',
      xp: 8,
      completed: false,
      category: 'Mental Health',
    },
    {
      id: 5,
      title: 'Take a walk',
      description: 'Walk for 15 minutes',
      xp: 10,
      completed: false,
      category: 'Physical Health',
    },
  ]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const getTasksByCategory = (category) => {
    return tasks.filter(task => task.category === category);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Tasks</Text>
          <Text style={styles.subtitle}>Complete tasks to earn XP!</Text>
        </View>

        <Card style={styles.categoryCard}>
          <Card.Content>
            <Text style={styles.categoryTitle}>Mental Health</Text>
            {getTasksByCategory('Mental Health').map(task => (
              <List.Item
                key={task.id}
                title={task.title}
                description={task.description}
                right={() => (
                  <View style={styles.taskRight}>
                    <Text style={styles.xpText}>{task.xp} XP</Text>
                    <Checkbox
                      status={task.completed ? 'checked' : 'unchecked'}
                      onPress={() => toggleTask(task.id)}
                    />
                  </View>
                )}
              />
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.categoryCard}>
          <Card.Content>
            <Text style={styles.categoryTitle}>Physical Health</Text>
            {getTasksByCategory('Physical Health').map(task => (
              <List.Item
                key={task.id}
                title={task.title}
                description={task.description}
                right={() => (
                  <View style={styles.taskRight}>
                    <Text style={styles.xpText}>{task.xp} XP</Text>
                    <Checkbox
                      status={task.completed ? 'checked' : 'unchecked'}
                      onPress={() => toggleTask(task.id)}
                    />
                  </View>
                )}
              />
            ))}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  categoryCard: {
    margin: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6200ee',
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    marginRight: 10,
    color: '#6200ee',
    fontWeight: 'bold',
  },
});

export default TasksScreen; 