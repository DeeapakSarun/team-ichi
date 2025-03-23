import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { Text, Surface, List, Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HelpCenterScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.header}>
        <MaterialCommunityIcons name="help-circle" size={40} color="#000" />
        <Text style={styles.headerTitle}>Help Center</Text>
        <Text style={styles.headerSubtitle}>Find answers to your questions</Text>
      </Surface>

      <ScrollView style={styles.content}>
        <Card style={styles.section}>
          <Card.Title title="About UpliftXP" />
          <Card.Content>
            <Text style={styles.paragraph}>
              UpliftXP is a holistic wellness app designed to help you track and improve your mental health, physical activities, and dietary habits.
            </Text>
            <Text style={styles.paragraph}>
              Complete daily tasks, take mental health assessments, and get personalized recommendations to improve your overall wellbeing.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Mental Health Assessments" />
          <Card.Content>
            <Text style={styles.paragraph}>
              Our mental health assessments are based on clinically validated screening tools from Mental Health America.
            </Text>
            <Text style={styles.paragraph}>
              These assessments can help identify symptoms of depression, anxiety, ADHD, and PTSD, but they are not a replacement for professional diagnosis.
            </Text>
            <Text style={styles.researchNote}>
              Research Source:
            </Text>
            <Button 
              mode="text" 
              onPress={() => Linking.openURL('https://screening.mhanational.org/screening-tools/?utm_source=chatgpt.comal Health America')}
              style={styles.linkButton}
            >
              Mental Health America Screening Tools
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Daily Tasks" />
          <Card.Content>
            <Text style={styles.paragraph}>
              Daily tasks are designed to help you build healthy habits. Complete tasks to earn XP and increase your streak.
            </Text>
            <Text style={styles.paragraph}>
              Missing tasks will generate penalty tasks that are more challenging but offer double XP.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Dietary Plans" />
          <Card.Content>
            <Text style={styles.paragraph}>
              Our dietary plan recommendations are generated based on your goals and preferences.
            </Text>
            <Text style={styles.paragraph}>
              Always consult with a healthcare professional or nutritionist before making significant changes to your diet.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="FAQ" />
          <Card.Content>
            <List.Accordion title="How is my level calculated?">
              <Text style={styles.accordionText}>
                Your level increases as you earn XP from completing tasks and assessments. Each level requires more XP than the previous one.
              </Text>
            </List.Accordion>
            
            <Divider style={styles.divider} />
            
            <List.Accordion title="What happens if I miss daily tasks?">
              <Text style={styles.accordionText}>
                Missing daily tasks will generate penalty tasks that are more challenging but offer double XP. These tasks will remain until completed.
              </Text>
            </List.Accordion>
            
            <Divider style={styles.divider} />
            
            <List.Accordion title="How do I maintain my streak?">
              <Text style={styles.accordionText}>
                Complete all your daily tasks each day to maintain and increase your streak. Missing a day will reset your streak to zero.
              </Text>
            </List.Accordion>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          icon="arrow-left"
        >
          Back to Profile
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
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    elevation: 2,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  researchNote: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  linkButton: {
    marginVertical: 8,
  },
  backButton: {
    marginBottom: 24,
  },
  divider: {
    marginVertical: 8,
  },
  accordionText: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
});

export default HelpCenterScreen; 