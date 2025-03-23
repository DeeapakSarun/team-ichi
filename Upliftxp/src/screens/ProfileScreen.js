import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, Surface, Avatar, List, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCurrentUser, getUserProfile, logout } from '../services/authService';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserData(profile);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth state change in AppNavigator
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
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
        {/* Profile Header */}
        <Surface style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={100}
              source={{ uri: userData.avatar || 'https://i.pravatar.cc/150?img=1' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.email}>{userData.email}</Text>
          <View style={styles.levelContainer}>
            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
            <Text style={styles.levelText}>Level {userData.level}</Text>
          </View>
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>
              {userData.xp} / {userData.nextLevelXp} XP
            </Text>
          </View>
        </Surface>

        {/* Stats Section */}
        <Surface style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#000" />
            <Text style={styles.statValue}>{userData.totalTasksCompleted || 0}</Text>
            <Text style={styles.statLabel}>Tasks Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF4500" />
            <Text style={styles.statValue}>{userData.streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </Surface>

        {/* Settings Section */}
        <Surface style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <List.Section>
            <List.Item
              title="Account Settings"
              description="Update your profile information"
              left={props => <List.Icon {...props} icon="account-cog" />}
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
            <Divider />
            <List.Item
              title="Notifications"
              description="Manage your notification preferences"
              left={props => <List.Icon {...props} icon="bell-outline" />}
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
            <Divider />
            <List.Item
              title="Privacy"
              description="Control your privacy settings"
              left={props => <List.Icon {...props} icon="shield-lock-outline" />}
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
            <Divider />
            <List.Item
              title="Help & Support"
              description="Get help and contact support"
              left={props => <List.Icon {...props} icon="help-circle-outline" />}
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
          </List.Section>
        </Surface>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor="#FF0000"
          >
            Log Out
          </Button>
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
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  xpContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  xpText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  settingsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 0,
  },
  logoutContainer: {
    padding: 20,
  },
  logoutButton: {
    borderColor: '#FF0000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen; 