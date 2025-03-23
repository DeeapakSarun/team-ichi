import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Avatar, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Avatar.Image
            size={80}
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.level}>Level 5</Text>
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>1500 / 2000 XP</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpProgress, { width: '75%' }]} />
            </View>
          </View>
        </View>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Your Progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>85%</Text>
                <Text style={styles.statLabel}>Task Completion</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>7</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Tasks Done</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Settings</Text>
            <List.Section>
              <List.Item
                title="Notifications"
                description="Manage notification preferences"
                left={props => <List.Icon {...props} icon="bell" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
              />
              <Divider />
              <List.Item
                title="Privacy"
                description="Manage your privacy settings"
                left={props => <List.Icon {...props} icon="shield-lock" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
              />
              <Divider />
              <List.Item
                title="Health Data"
                description="Manage health data permissions"
                left={props => <List.Icon {...props} icon="heart-pulse" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
              />
            </List.Section>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => {}}
          style={styles.logoutButton}
        >
          Logout
        </Button>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  level: {
    fontSize: 18,
    color: '#6200ee',
    marginBottom: 10,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  xpBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
  statsCard: {
    margin: 16,
  },
  settingsCard: {
    margin: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6200ee',
  },
  statsGrid: {
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
  logoutButton: {
    margin: 16,
  },
});

export default ProfileScreen; 