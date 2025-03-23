import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Text, Surface, Avatar, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const LeaderboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('xp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      
      const leaderboardData = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        rank: index + 1,
      }));
      
      setUsers(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, []);

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#666';
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
          <Text style={styles.title}>Global Leaderboard</Text>
          <Text style={styles.subtitle}>Top 100 players by XP</Text>
        </View>

        {users.map((user) => (
          <Surface key={user.id} style={styles.userCard}>
            <View style={styles.rankContainer}>
              <MaterialCommunityIcons
                name="trophy"
                size={24}
                color={getMedalColor(user.rank)}
              />
              <Text style={styles.rankText}>#{user.rank}</Text>
            </View>

            <View style={styles.userInfo}>
              <Avatar.Image
                size={50}
                source={{ uri: user.avatar || 'https://i.pravatar.cc/150?img=1' }}
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.levelText}>Level {user.level}</Text>
              </View>
            </View>

            <View style={styles.xpContainer}>
              <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
              <Text style={styles.xpText}>{user.xp}</Text>
            </View>
          </Surface>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  rankText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  levelText: {
    fontSize: 14,
    color: '#666',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  xpText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LeaderboardScreen; 