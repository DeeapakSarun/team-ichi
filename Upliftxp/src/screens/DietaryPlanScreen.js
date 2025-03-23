import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text, TextInput, Button, Surface, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DietaryPlanScreen = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const dietTopics = [
    'weight loss plan',
    'balanced diet',
    'high-protein diet',
    'low-carb diet',
    'vegetarian diet',
    'keto diet',
    'intermittent fasting',
    'healthy meal plans',
    'heart-healthy diet',
    'diabetes-friendly diet',
    'meal prepping',
    'nutrition for muscle gain',
    'detox diet',
    'vitamin-rich foods',
    'hydration tips',
    'healthy snacks',
    'immune-boosting foods',
    'foods for better digestion',
    'foods for glowing skin',
    'healthy breakfasts',
    'meal plans for athletes',
    'diet for weight maintenance',
    'mindful eating',
    'portion control',
    'anti-inflammatory foods',
    'meal planning for busy people',
  ];

  const formatResponse = (text) => {
    // First, split the text into sections based on headers
    let sections = text.split(/(?=^#+\s+)/m);

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

  const getDietaryAdvice = async (topic) => {
    setLoading(true);
    setSelectedTopic(topic);
    setResponse('');

    try {
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
              content: `Provide detailed information about ${topic} for a healthy body. Include meal suggestions, tips, and best practices. Format the response with clear sections and bullet points for better readability.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        const formattedResponse = formatResponse(data.choices[0].message.content);
        setResponse(formattedResponse);
      } else {
        setResponse('Sorry, I could not generate a response at this time.');
      }
    } catch (error) {
      console.error('Error fetching dietary advice:', error);
      setResponse('Sorry, there was an error getting your dietary advice.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomQuery = () => {
    if (query.trim()) {
      getDietaryAdvice(query);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Dietary Plan</Text>
          
          {/* Custom Query Section */}
          <Surface style={styles.querySection}>
            <Text style={styles.sectionTitle}>Ask a Diet Question</Text>
            <TextInput
              mode="outlined"
              label="Enter your diet-related question"
              value={query}
              onChangeText={setQuery}
              style={styles.input}
              multiline
            />
            <Button
              mode="contained"
              onPress={handleCustomQuery}
              style={styles.submitButton}
              disabled={!query.trim()}
            >
              Get Advice
            </Button>
          </Surface>

          {/* Popular Topics Section */}
          <Text style={styles.sectionTitle}>Popular Topics</Text>
          <View style={styles.topicsGrid}>
            {dietTopics.map((topic, index) => (
              <Card
                key={index}
                style={[
                  styles.topicCard,
                  selectedTopic === topic && styles.selectedTopic,
                ]}
                onPress={() => getDietaryAdvice(topic)}
              >
                <Card.Content>
                  <Text style={styles.topicText}>{topic}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>

          {/* Response Section */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>Generating your dietary advice...</Text>
            </View>
          ) : response ? (
            <Surface style={styles.responseSection}>
              <Text style={styles.responseTitle}>
                {selectedTopic ? `About ${selectedTopic}` : 'Dietary Advice'}
              </Text>
              <Text style={styles.responseText}>{response}</Text>
            </Surface>
          ) : null}
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  querySection: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#000',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  topicCard: {
    width: '48%',
    marginBottom: 12,
  },
  selectedTopic: {
    backgroundColor: '#e0e0e0',
  },
  topicText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  responseSection: {
    padding: 16,
    borderRadius: 8,
  },
  responseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default DietaryPlanScreen; 