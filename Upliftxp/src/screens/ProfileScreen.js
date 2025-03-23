import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, Surface, Avatar, List, Button, Divider, Dialog, Portal, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { logout } from '../services/authService';
import { useUser } from '../context/UserContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

const ProfileScreen = () => {
  const { userData, loading, refreshUserData, updateUserData } = useUser();
  const [devMode, setDevMode] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleLogout = async () => {
    try {
      await logout();
      // The AppNavigator will automatically handle navigation based on auth state
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const toggleDevMode = () => {
    setDevMode(!devMode);
  };

  const handleDateChange = async () => {
    try {
      const user = await auth.currentUser;
      if (!user) return;

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format');
        return;
      }

      // Update last task date in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        lastTaskDate: selectedDate,
        lastStreakDate: selectedDate,
        completedTasks: {}, // Reset completed tasks for the new date
        dailyTasks: [], // Clear daily tasks to trigger refresh
      });

      // Refresh user data
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        updateUserData({
          ...data,
          lastTaskDate: selectedDate,
          lastStreakDate: selectedDate,
        });
      }

      setShowDateDialog(false);
      Alert.alert('Success', 'Date updated successfully! Tasks will refresh.');
    } catch (error) {
      console.error('Error updating date:', error);
      Alert.alert('Error', 'Failed to update date');
    }
  };

  const handleResetLevel = async () => {
    try {
      const user = await auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        xp: 0,
        level: 1,
        nextLevelXp: 1000,
        streak: 0,
        lastStreakDate: '2000-01-01',
        completedTasks: {},
        dailyTasks: [],
        lastTaskDate: new Date().toISOString().split('T')[0],
      });

      // Refresh user data
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        updateUserData({
          ...data,
          xp: 0,
          level: 1,
          nextLevelXp: 1000,
          streak: 0,
          lastStreakDate: '2000-01-01',
        });
      }

      Alert.alert('Success', 'Level and progress have been reset!');
    } catch (error) {
      console.error('Error resetting level:', error);
      Alert.alert('Error', 'Failed to reset level');
    }
  };

  if (loading || !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.header}>
          <Avatar.Text 
            size={80} 
            label={userData.username ? userData.username[0].toUpperCase() : 'U'} 
          />
          <Text style={styles.username}>{userData.username || 'User'}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </Surface>

        <Surface style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.level || 1}</Text>
            <Text style={styles.statLabel}>Level 🏆</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.xp || 0}</Text>
            <Text style={styles.statLabel}>XP ⭐</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.streak || 0}</Text>
            <Text style={styles.statLabel}>Streak 🔥</Text>
          </View>
        </Surface>

        <List.Section>
          <List.Subheader>Account Settings</List.Subheader>
          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit" />}
            onPress={() => {}}
          />
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            onPress={() => {}}
          />
          <List.Item
            title="Privacy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => {}}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Support</List.Subheader>
          <List.Item
            title="Help Center"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {}}
          />
          <List.Item
            title="Contact Us"
            left={props => <List.Icon {...props} icon="email" />}
            onPress={() => {}}
          />
        </List.Section>

        {devMode && (
          <View style={styles.devSection}>
            <Text style={styles.devTitle}>Developer Options</Text>
            <Button
              mode="outlined"
              onPress={() => setShowDateDialog(true)}
              style={styles.devButton}
            >
              Change Date
            </Button>
            <Button
              mode="outlined"
              onPress={handleResetLevel}
              style={styles.devButton}
              textColor="red"
            >
              Reset Level & Progress
            </Button>
          </View>
        )}

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Sign Out
        </Button>

        <Button
          mode="text"
          onPress={toggleDevMode}
          style={styles.devModeButton}
        >
          {devMode ? 'Disable Developer Mode' : 'Enable Developer Mode'}
        </Button>

        <Portal>
          <Dialog visible={showDateDialog} onDismiss={() => setShowDateDialog(false)}>
            <Dialog.Title>Change Date</Dialog.Title>
            <Dialog.Content>
              <TextInput
                mode="outlined"
                label="Date (YYYY-MM-DD)"
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDateDialog(false)}>Cancel</Button>
              <Button onPress={handleDateChange}>Update</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    margin: 16,
    borderColor: '#ff4444',
  },
  devModeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  devSection: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginTop: 16,
    borderRadius: 8,
  },
  devTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#666',
  },
  devButton: {
    marginVertical: 4,
  },
});

export default ProfileScreen; 