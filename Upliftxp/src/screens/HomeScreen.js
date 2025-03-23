import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Text, Surface, ProgressBar, Card, Button, IconButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { stepService } from '../services/stepService';
import * as Location from 'expo-location';
import { getCurrentUser, getUserProfile } from '../services/authService';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';

const HomeScreen = ({ navigation }) => {
  const { userData, loading, updateUserData } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelXp, setNextLevelXp] = useState(1000);
  const [userId, setUserId] = useState(null);
  const [mentalHealthTips, setMentalHealthTips] = useState('');
  const [loadingTips, setLoadingTips] = useState(false);
  const [testScores, setTestScores] = useState({});
  const [sensorPermissionStatus, setSensorPermissionStatus] = useState({
    accelerometer: false,
    location: false
  });
  
  // Distance goal in meters
  const distanceGoal = 20;

  useEffect(() => {
    initializeUser();
    return () => {
      stepService.stopTracking();
    };
  }, []);

  const initializeUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.uid);
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          const currentLevel = calculateLevel(userProfile.xp);
          const nextLevelXp = getNextLevelXP(userProfile.xp);
          
          setXp(userProfile.xp);
          setLevel(currentLevel);
          setNextLevelXp(nextLevelXp);
          setTestScores(userProfile.mentalHealthTests || {});
          setSteps(userProfile.dailySteps || 0);
          setDistance(userProfile.dailyDistance || 0);
          await generateMentalHealthTips(userProfile.mentalHealthTests || {});
        }
        
        // Start step tracking with user ID
        stepService.startTracking(user.uid);
        
        // Setup an interval to update step count and distance in UI
        const updateInterval = setInterval(() => {
          setSteps(stepService.getSteps());
          setDistance(stepService.getDistance());
        }, 1000);
        
        // Clean up interval on component unmount
        return () => clearInterval(updateInterval);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  const requestAccelerometerPermission = async () => {
    const hasPermission = await stepService.requestAccelerometerPermission();
    setSensorPermissionStatus(prev => ({
      ...prev,
      accelerometer: hasPermission
    }));
    
    if (hasPermission && userId) {
      // Restart tracking to apply new permissions
      stepService.stopTracking();
      stepService.startTracking(userId);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      const hasPermission = status === 'granted';
      setSensorPermissionStatus(prev => ({
        ...prev,
        location: hasPermission
      }));
      
      if (hasPermission) {
        Alert.alert(
          'Permission Granted',
          'Location access will help improve step counting accuracy.',
          [{ text: 'OK' }]
        );
        
        // Restart step tracking with location
        if (userId) {
          stepService.stopTracking();
          stepService.startTracking(userId);
        }
      } else {
        Alert.alert(
          'Permission Denied',
          'Step counting will be less accurate without location access.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const formatTips = (text) => {
    // Split the text into sections based on headers or bold text
    let sections = text.split(/(?=^#+\s+|\*\*)/m);

    // Process each section
    sections = sections.map(section => {
      // Handle headers
      section = section.replace(/^#+\s+(.*)$/m, (match, content) => {
        return `\n${content.toUpperCase()}\n`;
      });

      // Handle bold text within paragraphs
      section = section.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        return content;
      });

      // Handle lists (both bullet points and numbers)
      section = section.replace(/^\s*[-*]\s+(.*)$/gm, (match, content) => {
        return `\n• ${content}`;
      });
      section = section.replace(/^\s*\d+\.\s+(.*)$/gm, (match, content) => {
        return `\n• ${content}`;
      });

      // Handle paragraphs
      section = section.replace(/\n{3,}/g, '\n\n');

      return section.trim();
    });

    // Join sections with proper spacing
    return sections.join('\n\n').trim();
  };

  const generateMentalHealthTips = async (testScores) => {
    setLoadingTips(true);
    try {
      const scores = Object.entries(testScores)
        .map(([test, data]) => `${test}: ${data.lastScore}%`)
        .join(', ');

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: `Based on these mental health test scores: ${scores}. Provide 3 personalized tips for improving mental well-being. Format the response with bullet points and keep it concise and actionable.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        const formattedTips = formatTips(data.choices[0].message.content);
        setMentalHealthTips(formattedTips);
      }
    } catch (error) {
      console.error('Error generating tips:', error);
      setMentalHealthTips('Unable to generate tips at this time.');
    } finally {
      setLoadingTips(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (userId) {
        const userProfile = await getUserProfile(userId);
        if (userProfile) {
          const currentLevel = calculateLevel(userProfile.xp);
          const nextLevelXp = getNextLevelXP(userProfile.xp);
          
          setXp(userProfile.xp);
          setLevel(currentLevel);
          setNextLevelXp(nextLevelXp);
          setSteps(userProfile.dailySteps || 0);
          setDistance(userProfile.dailyDistance || 0);
          setTestScores(userProfile.mentalHealthTests || {});
          await generateMentalHealthTips(userProfile.mentalHealthTests || {});
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const calculateLevel = (xp) => {
    if (xp < 1000) return 1;
    if (xp < 9000) return Math.floor(xp / 1000) + 1;
    return Math.floor((xp - 9000) / 1000) + 10;
  };

  const calculateLevelProgress = (xp) => {
    const level = calculateLevel(xp);
    if (level < 10) {
      const levelStartXP = (level - 1) * 1000;
      const levelEndXP = level * 1000;
      return (xp - levelStartXP) / (levelEndXP - levelStartXP);
    } else {
      const levelStartXP = 9000 + (level - 10) * 1000;
      const levelEndXP = levelStartXP + 1000;
      return (xp - levelStartXP) / (levelEndXP - levelStartXP);
    }
  };

  const getNextLevelXP = (currentXP) => {
    const level = calculateLevel(currentXP);
    if (level < 10) {
      return level * 1000;
    } else {
      return 9000 + (level - 9) * 1000;
    }
  };

  const handleTaskComplete = async (taskId, xpReward) => {
    try {
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const newXp = userData.xp + xpReward;
        const newLevel = calculateLevel(newXp);
        const newNextLevelXp = getNextLevelXP(newXp);

        await updateDoc(userRef, {
          xp: newXp,
          level: newLevel,
          nextLevelXp: newNextLevelXp,
          totalTasksCompleted: (userData.totalTasksCompleted || 0) + 1,
        });

        setXp(newXp);
        setLevel(newLevel);
        setNextLevelXp(newNextLevelXp);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  if (loading || !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* XP Progress Section */}
        <Surface style={styles.xpContainer}>
          <View style={styles.xpHeader}>
            <Text style={styles.levelText}>Level {level}</Text>
            <Text style={styles.xpText}>{xp} / {nextLevelXp} XP</Text>
          </View>
          <ProgressBar
            progress={calculateLevelProgress(xp)}
            color="#000"
            style={styles.progressBar}
          />
        </Surface>

        {/* Daily Stats Section */}
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsRow}>
                <MaterialCommunityIcons name="star" size={24} color="#000" />
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsValue}>{xp}</Text>
                  <Text style={styles.statsLabel}>XP Earned</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsRow}>
                <MaterialCommunityIcons name="trophy" size={24} color="#000" />
                <View style={styles.statsTextContainer}>
                  <Text style={styles.statsValue}>{userData.streak || 0}</Text>
                  <Text style={styles.statsLabel}>Day Streak</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
        
        {/* Distance Section (formerly Steps) */}
        <Surface style={styles.stepsContainer}>
          <View style={styles.stepsHeader}>
            <Text style={styles.stepsTitle}>Distance Traveled</Text>
            <View style={styles.permissionButtons}>
              <IconButton
                icon="motion-sensor"
                size={20}
                onPress={requestAccelerometerPermission}
                style={styles.sensorButton}
                iconColor="#4CAF50"
              />
              <IconButton
                icon="map-marker"
                size={20}
                onPress={requestLocationPermission}
                style={styles.locationButton}
                iconColor="#4CAF50"
              />
            </View>
          </View>
          
          <View style={styles.stepsCountContainer}>
            <MaterialCommunityIcons name="map-marker-distance" size={40} color="#4CAF50" />
            <Text style={styles.stepsCount}>{distance.toFixed(2)} m</Text>
            <Text style={styles.stepsGoal}>Goal: {distanceGoal} meters</Text>
          </View>
          
          <View style={styles.stepsProgressContainer}>
            <ProgressBar
              progress={Math.min(distance / distanceGoal, 1)}
              color="#4CAF50"
              style={styles.stepsProgressBar}
            />
            <Text style={styles.stepsProgressText}>
              {Math.round((distance / distanceGoal) * 100)}% Complete
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.permissionsInfo}>
            <Text style={styles.permissionsTitle}>Sensor Permissions:</Text>
            <View style={styles.permissionItem}>
              <MaterialCommunityIcons 
                name="motion-sensor" 
                size={16} 
                color={sensorPermissionStatus.accelerometer ? "#4CAF50" : "#999"} 
              />
              <Text style={[
                styles.permissionText, 
                {color: sensorPermissionStatus.accelerometer ? "#4CAF50" : "#999"}
              ]}>
                Motion Sensors: {sensorPermissionStatus.accelerometer ? "Granted" : "Required"}
              </Text>
            </View>
            <View style={styles.permissionItem}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={16} 
                color={sensorPermissionStatus.location ? "#4CAF50" : "#999"} 
              />
              <Text style={[
                styles.permissionText, 
                {color: sensorPermissionStatus.location ? "#4CAF50" : "#666"}
              ]}>
                Location: {sensorPermissionStatus.location ? "Granted" : "Optional - Improves accuracy"}
              </Text>
            </View>
          </View>
        </Surface>

        {/* Mental Health Tips Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personalized Mental Health Tips</Text>
          <Card style={styles.tipsCard}>
            <Card.Content>
              {loadingTips ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#000" />
                  <Text style={styles.loadingText}>Generating tips...</Text>
                </View>
              ) : (
                <Text style={styles.tipsText}>
                  {mentalHealthTips || 'Take a mental health assessment to get personalized tips.'}
                </Text>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Mental Health Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mental Health Assessment</Text>
          <Card style={styles.featureCard}>
            <Card.Content>
              <View style={styles.featureContent}>
                <MaterialCommunityIcons name="brain" size={32} color="#000" />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Mental Health Tests</Text>
                  <Text style={styles.featureDescription}>Take assessments for Depression, Anxiety, ADHD, and PTSD</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('MentalHealth')}
                  style={styles.featureButton}
                >
                  Start Test
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Dietary Plan Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dietary Plan</Text>
          <Card style={styles.featureCard}>
            <Card.Content>
              <View style={styles.featureContent}>
                <MaterialCommunityIcons name="food-apple" size={32} color="#000" />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Personalized Diet Plan</Text>
                  <Text style={styles.featureDescription}>Get customized diet recommendations based on your goals</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('DietaryPlan')}
                  style={styles.featureButton}
                >
                  Get Plan
                </Button>
              </View>
            </Card.Content>
          </Card>
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
  xpContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
    elevation: 2,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 16,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTextContainer: {
    marginLeft: 12,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipsCard: {
    marginBottom: 16,
  },
  tipsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 16,
  },
  featureCard: {
    marginBottom: 16,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  featureButton: {
    backgroundColor: '#000',
  },
  stepsContainer: {
    margin: 16,
    padding: 16,
    elevation: 4,
    borderRadius: 8,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionButtons: {
    flexDirection: 'row',
  },
  sensorButton: {
    margin: 0,
  },
  locationButton: {
    margin: 0,
  },
  stepsCountContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  stepsCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 8,
  },
  stepsGoal: {
    fontSize: 14,
    color: '#666',
  },
  stepsProgressContainer: {
    marginBottom: 12,
  },
  stepsProgressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  stepsProgressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  permissionsInfo: {
    marginTop: 4,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default HomeScreen; 