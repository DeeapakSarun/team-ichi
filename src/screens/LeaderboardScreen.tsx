import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Avatar, Title, Divider } from 'react-native-paper';

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  rank: number;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'HealthMaster', xp: 5000, rank: 1 },
  { id: '2', username: 'FitnessGuru', xp: 4500, rank: 2 },
  { id: '3', username: 'WellnessWarrior', xp: 4000, rank: 3 },
  { id: '4', username: 'MindfulSoul', xp: 3500, rank: 4 },
  { id: '5', username: 'BalanceSeeker', xp: 3000, rank: 5 },
];

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Global Leaderboard</Title>
      <ScrollView>
        {leaderboard.map((entry) => (
          <React.Fragment key={entry.id}>
            <List.Item
              title={entry.username}
              description={`XP: ${entry.xp}`}
              left={() => (
                <View style={styles.rankContainer}>
                  <Title style={styles.rank}>{entry.rank}</Title>
                </View>
              )}
              right={() => (
                <Avatar.Text
                  size={40}
                  label={entry.username.substring(0, 2)}
                  style={[
                    styles.avatar,
                    entry.rank === 1 && styles.goldAvatar,
                    entry.rank === 2 && styles.silverAvatar,
                    entry.rank === 3 && styles.bronzeAvatar,
                  ]}
                />
              )}
            />
            <Divider />
          </React.Fragment>
        ))}
      </ScrollView>
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
  rankContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rank: {
    fontSize: 20,
  },
  avatar: {
    backgroundColor: '#666',
  },
  goldAvatar: {
    backgroundColor: '#FFD700',
  },
  silverAvatar: {
    backgroundColor: '#C0C0C0',
  },
  bronzeAvatar: {
    backgroundColor: '#CD7F32',
  },
});

export default LeaderboardScreen; 