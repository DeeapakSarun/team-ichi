import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, Surface, Button, ProgressBar, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from '../services/authService';
import { useUser } from '../context/UserContext';

const MentalHealthScreen = () => {
  const { userData, updateUserData } = useUser();
  const [currentTest, setCurrentTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [testHistory, setTestHistory] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setTestHistory(userData.mentalHealthTests || {});
          
          // Check for in-progress test
          if (userData.currentTest) {
            setCurrentTest(userData.currentTest.testName);
            setCurrentQuestion(userData.currentTest.currentQuestion);
            setAnswers(userData.currentTest.answers || {});
          }
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const tests = {
    depression: {
      title: 'Depression Assessment',
      questions: [
        'Little interest or pleasure in doing things?',
        'Feeling down, depressed, or hopeless?',
        'Trouble falling or staying asleep, or sleeping too much?',
        'Feeling tired or having little energy?',
        'Poor appetite or overeating?',
        'Feeling bad about yourself or that you are a failure?',
        'Trouble concentrating on things?',
        'Moving or speaking slowly, or being fidgety/restless?',
        'Thoughts that you would be better off dead or of hurting yourself?',
      ],
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
      maxScore: 27,
    },
    anxiety: {
      title: 'Anxiety Assessment',
      questions: [
        'Feeling nervous, anxious, or on edge?',
        'Not being able to stop or control worrying?',
        'Worrying too much about different things?',
        'Trouble relaxing?',
        'Being so restless that it\'s hard to sit still?',
        'Becoming easily annoyed or irritable?',
        'Feeling afraid as if something awful might happen?',
      ],
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
      maxScore: 21,
    },
    adhd: {
      title: 'ADHD Assessment',
      questions: [
        'How often do you have trouble wrapping up the final details of a project?',
        'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
        'How often do you have problems remembering appointments or obligations?',
        'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
        'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
        'How often do you feel overly active and compelled to do things, as if driven by a motor?',
        'How often do you make careless mistakes when you have to work on a boring or difficult project?',
        'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
        'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
        'How often do you misplace or have difficulty finding things at home or at work?',
      ],
      options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
      maxScore: 40,
    },
    ptsd: {
      title: 'PTSD Assessment',
      questions: [
        'Repeated, disturbing memories, thoughts, or images of a stressful experience from the past?',
        'Repeated, disturbing dreams of a stressful experience from the past?',
        'Suddenly acting or feeling as if a stressful experience was happening again?',
        'Feeling very upset when something reminded you of a stressful experience from the past?',
        'Having physical reactions when something reminded you of a stressful experience from the past?',
        'Avoiding thinking about or talking about a stressful experience from the past?',
        'Avoiding activities or situations because they reminded you of a stressful experience from the past?',
        'Trouble remembering important parts of a stressful experience from the past?',
        'Loss of interest in activities that you used to enjoy?',
        'Feeling distant or cut off from other people?',
      ],
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'],
      maxScore: 40,
    },
  };

  const startTest = async (testName) => {
    try {
      if (!userId) return;

      // Store initial test state in Firebase
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        currentTest: {
          testName,
          currentQuestion: 0,
          answers: {},
          startedAt: new Date().toISOString()
        }
      });

      setCurrentTest(testName);
      setCurrentQuestion(0);
      setAnswers({});
      setScores({});
    } catch (error) {
      console.error('Error starting test:', error);
      Alert.alert('Error', 'Failed to start test. Please try again.');
    }
  };

  const handleAnswer = async (answer) => {
    try {
      if (!userId) return;

      const newAnswers = {
        ...answers,
        [currentQuestion]: answer,
      };

      // Update Firebase with current progress
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        currentTest: {
          testName: currentTest,
          currentQuestion: currentQuestion + 1,
          answers: newAnswers,
          startedAt: new Date().toISOString()
        }
      });

      setAnswers(newAnswers);

      if (currentQuestion < tests[currentTest].questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        calculateScore();
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      Alert.alert('Error', 'Failed to save answer. Please try again.');
    }
  };

  const calculateScore = async () => {
    try {
      const test = tests[currentTest];
      let score = 0;
      const answerValues = {
        'Not at all': 0,
        'A little bit': 1,
        'Several days': 1,
        'Moderately': 2,
        'More than half the days': 2,
        'Quite a bit': 3,
        'Nearly every day': 3,
        'Extremely': 4,
        'Never': 0,
        'Rarely': 1,
        'Sometimes': 2,
        'Often': 3,
        'Very Often': 4,
      };

      Object.values(answers).forEach(answer => {
        score += answerValues[answer] || 0;
      });

      const percentage = (score / test.maxScore) * 100;
      const newScores = { ...scores, [currentTest]: percentage };
      setScores(newScores);

      // Store the test result and clear current test
      await storeTestResult(currentTest, percentage);
      
      // Clear current test from Firebase
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        currentTest: null
      });
    } catch (error) {
      console.error('Error calculating score:', error);
      Alert.alert('Error', 'Failed to calculate score. Please try again.');
    }
  };

  const storeTestResult = async (testName, score) => {
    try {
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentTests = userData.mentalHealthTests || {};
        const newTests = {
          ...currentTests,
          [testName]: {
            lastScore: score,
            lastTaken: new Date().toISOString(),
            history: [
              ...(currentTests[testName]?.history || []),
              { score, date: new Date().toISOString() }
            ]
          }
        };

        await updateDoc(userRef, {
          mentalHealthTests: newTests
        });

        // Update the local context
        updateUserData({
          mentalHealthTests: newTests
        });

        setTestHistory(newTests);
      }
    } catch (error) {
      console.error('Error storing test result:', error);
      Alert.alert('Error', 'Failed to save test result');
    }
  };

  const getRecommendation = (score) => {
    if (score >= 75) {
      return 'Your score suggests significant symptoms. We strongly recommend consulting with a mental health professional.';
    } else if (score >= 50) {
      return 'Your score suggests moderate symptoms. Consider talking to a counselor or mental health professional.';
    } else if (score >= 25) {
      return 'Your score suggests mild symptoms. Try implementing self-care practices and monitor your symptoms.';
    } else {
      return 'Your score suggests minimal symptoms. Continue practicing self-care and monitor your well-being.';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentTest) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={styles.title}>Mental Health Assessments</Text>
          {Object.entries(tests).map(([key, test]) => (
            <Card key={key} style={styles.testCard}>
              <Card.Content>
                <Text style={styles.testTitle}>{test.title}</Text>
                <Text style={styles.testDescription}>
                  {test.questions.length} questions • {test.options.length} options per question
                </Text>
                {testHistory[key] && (
                  <View style={styles.historyContainer}>
                    <Text style={styles.historyText}>
                      Last Score: {testHistory[key].lastScore.toFixed(1)}%
                    </Text>
                    <Text style={styles.historyText}>
                      Last Taken: {new Date(testHistory[key].lastTaken).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                <Button
                  mode="contained"
                  onPress={() => startTest(key)}
                  style={styles.startButton}
                >
                  Start Test
                </Button>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const test = tests[currentTest];
  const progress = (currentQuestion + 1) / test.questions.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {test.questions.length}
          </Text>
          <ProgressBar progress={progress} color="#000" style={styles.progressBar} />
        </Surface>

        <Card style={styles.questionCard}>
          <Card.Content>
            <Text style={styles.questionText}>{test.questions[currentQuestion]}</Text>
            {test.options.map((option, index) => (
              <Button
                key={index}
                mode="outlined"
                onPress={() => handleAnswer(option)}
                style={styles.optionButton}
              >
                {option}
              </Button>
            ))}
          </Card.Content>
        </Card>

        {scores[currentTest] !== undefined && (
          <Card style={styles.resultCard}>
            <Card.Content>
              <Text style={styles.resultTitle}>Test Results</Text>
              <Text style={styles.scoreText}>
                Score: {scores[currentTest].toFixed(1)}%
              </Text>
              <Text style={styles.recommendationText}>
                {getRecommendation(scores[currentTest])}
              </Text>
              <Button
                mode="contained"
                onPress={() => setCurrentTest(null)}
                style={styles.finishButton}
              >
                Finish
              </Button>
            </Card.Content>
          </Card>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 0,
  },
  testCard: {
    margin: 16,
    marginTop: 8,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  historyContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  historyText: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#000',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
    elevation: 2,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  questionCard: {
    margin: 16,
    marginTop: 8,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 16,
  },
  optionButton: {
    marginBottom: 8,
  },
  resultCard: {
    margin: 16,
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  finishButton: {
    backgroundColor: '#000',
  },
});

export default MentalHealthScreen; 