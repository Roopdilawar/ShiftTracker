import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { auth } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check if the email matches the specific admin email
        if (user.email === 'swastik@lscarriers.ca') {
          navigation.replace('DriverList'); // Corrected typo here
        } else {
          navigation.replace('Home');
        }
      }
    });

    return unsubscribe; // Clean up the subscription on unmount
  }, [navigation]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // After login, check if the email matches the specific admin email
      if (userCredential.user.email === 'swastik@lscarriers.ca') { // Fixed the reference here
        navigation.replace('DriverList');
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Login Error', 'Incorrect Email or Password ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={{ uri: 'https://source.unsplash.com/random' }} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('./assets/scorpion_logo.png')} style={styles.logo} />
        <Text style={styles.appName}>ShiftTracker</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0288D1',
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0288D1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signUpButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#0288D1',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen;
