import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from './AuthContext'; // Verify this points cleanly to your context path!

export default function LoginScreen() {
  const { login, continueAsGuest } = useAuth();
  
  // 1. Local UI States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. The Form Submission Trigger
  const handleLogin = async () => {
    // Basic validation safety check
    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    // Call your AuthContext tower!
    const result = await login(email, password);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Login failed. Check your credentials.');
    }
    // NOTE: If successful, your App.tsx switchboard will automatically 
    // catch the session change and swap the screen for you!
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to manage your pantry expirations</Text>

      {/* Error Alert Box */}
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      {/* Email Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Password Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} // Hides characters for safety
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.guestButton} onPress={continueAsGuest}>
        <Text style={styles.guestButtonText}>Continue as Guest</Text>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: 'teal',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    height: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '500',
  },
  guestButton: {
    borderWidth: 1,
    borderColor: 'teal',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    height: 50,
  },
  guestButtonText: {
    color: 'teal',
    fontSize: 16,
    fontWeight: '600',
  },
});