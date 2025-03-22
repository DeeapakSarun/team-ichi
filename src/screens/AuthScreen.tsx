import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Title } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      // Here we'll implement Firebase authentication
      // For now, just mock the sign in
      await signIn({ email });
      navigation.replace('Home');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>UpliftXP</Title>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSignIn} style={styles.button}>
        Sign In
      </Button>
      <Button mode="outlined" onPress={() => {}} style={styles.button}>
        Sign in with Google
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
});

export default AuthScreen; 