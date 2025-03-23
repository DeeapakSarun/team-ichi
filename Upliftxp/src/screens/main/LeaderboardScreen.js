import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const LeaderboardScreen = () => {
  const [users] = useState([
    {
      id: 1,
      name: 'John Doe',
      xp: 2500,
      rank: 1,
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: 2,
      name: 'Jane Smith',
      xp: 2300,
      rank: 2,
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      xp: 2100,
      rank: 3,
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      xp: 1900,
      rank: 4,
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    {
      id: 5,
      name: 'David Brown',
      xp: 1700,
      rank: 5,
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
  ]);

  const getRankColor = (rank) => {
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Global Leaderboard</Text>
          <Text style={styles.subtitle}>Top performers this week</Text>
        </View>

        <Card style={styles.leaderboardCard}>
          <Card.Content>
            {users.map(user => (
              <List.Item
                key={user.id}
                title={user.name}
                description={`${user.xp} XP`}
                left={props => (
                  <View style={styles.rankContainer}>
                    <Text
                      style={[
                        styles.rankText,
                        { color: getRankColor(user.rank) }
                      ]}
                    >
                      #{user.rank}
                    </Text>
                  </View>
                )}
                right={props => (
                  <Avatar.Image
                    size={40}
                    source={{ uri: user.avatar }}
                    style={styles.avatar}
                  />
                )}
              />
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.statsTitle}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>1500</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>#12</Text>
                <Text style={styles.statLabel}>Your Rank</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>85%</Text>
                <Text style={styles.statLabel}>Task Completion</Text>
              </View>
            </View>
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
  leaderboardCard: {
    margin: 16,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  statsCard: {
    margin: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6200ee',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default LeaderboardScreen; 