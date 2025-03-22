import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Checkbox, Title, FAB } from 'react-native-paper';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  xpValue: number;
  category: 'mental' | 'physical';
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Morning Meditation',
    completed: false,
    xpValue: 50,
    category: 'mental',
  },
  {
    id: '2',
    title: '30 Minutes Exercise',
    completed: false,
    xpValue: 100,
    category: 'physical',
  },
  {
    id: '3',
    title: 'Drink 8 Glasses of Water',
    completed: false,
    xpValue: 50,
    category: 'physical',
  },
  {
    id: '4',
    title: 'Journal Entry',
    completed: false,
    xpValue: 50,
    category: 'mental',
  },
];

const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Daily Tasks</Title>
      <ScrollView>
        <List.Section title="Mental Health Tasks">
          {tasks
            .filter(task => task.category === 'mental')
            .map(task => (
              <List.Item
                key={task.id}
                title={task.title}
                description={`XP: ${task.xpValue}`}
                left={props => (
                  <Checkbox
                    status={task.completed ? 'checked' : 'unchecked'}
                    onPress={() => toggleTask(task.id)}
                  />
                )}
              />
            ))}
        </List.Section>

        <List.Section title="Physical Health Tasks">
          {tasks
            .filter(task => task.category === 'physical')
            .map(task => (
              <List.Item
                key={task.id}
                title={task.title}
                description={`XP: ${task.xpValue}`}
                left={props => (
                  <Checkbox
                    status={task.completed ? 'checked' : 'unchecked'}
                    onPress={() => toggleTask(task.id)}
                  />
                )}
              />
            ))}
        </List.Section>
      </ScrollView>
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {}}
        label="Add Task"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginVertical: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TasksScreen; 