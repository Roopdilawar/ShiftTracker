// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import HomeScreen from './HomeScreen';
import ClockInConfirmation from './ClockInConfirmation';
import ClockOutConfirmation from './ClockOutConfirmation';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} // Hide header for Login screen
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }} // Hide header for SignUp screen
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} // Hide header for Home screen
        />
        <Stack.Screen
          name="ClockInConfirmation"
          component={ClockInConfirmation}
          options={{ headerShown: false }} // Hide header for ClockInConfirmation screen
        />
        <Stack.Screen
          name="ClockOutConfirmation"
          component={ClockOutConfirmation}
          options={{ headerShown: false }} // Hide header for ClockOutConfirmation screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
