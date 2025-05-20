import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';

export default function VerifyEmail() {
  const handleResend = () => {
    // Implement resend verification email logic
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Verify Email',
          headerBackVisible: false,
        }}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to your email address. Please click the link to verify your account.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleResend}>
          <Text style={styles.buttonText}>Resend Verification Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={handleBack}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#493d8a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#62656b',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#493d8a',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 15,
  },
  linkText: {
    color: '#493d8a',
    fontSize: 16,
    textAlign: 'center',
  },
}); 