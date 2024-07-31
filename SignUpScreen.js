// SignUpScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        updateProfile(userCredential.user, { displayName: fullName })
          .then(() => {
            navigation.navigate('Home');
          })
          .catch(error => {
            console.error('Profile update error:', error);
          });
      })
      .catch(error => {
        console.error('Sign up error:', error);
      });
  };

  return (
    <View>
      <TextInput placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

export default SignUpScreen;
