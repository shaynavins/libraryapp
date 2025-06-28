import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Footer from '../../components/Footer';
import { auth } from '../../firebaseConfig';

export default function signup() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const signup = async () => {
        setLoading(true);
        if (!email.endsWith('@hyderabad.bits-pilani.ac.in')) {
            setError('You must use your @hyderabad.bits-pilani.ac.in email to sign up.');
            setLoading(false);
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.replace('./index');
        } catch(err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
      <LinearGradient colors={["#e0e7ff", "#f3f6fa", "#f9fafb"]} style={{ flex: 1 }}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.card}>
              <Text style={styles.heading}>Create Account</Text>
              <Text style={styles.subheading}>Sign up to get started</Text>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#a1a1aa"
              />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#a1a1aa"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable style={styles.button} onPress={signup} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
              </Pressable>
              <Pressable style={styles.linkBtn} onPress={() => router.replace('./index') }>
                <Text style={styles.linkText}>Already have an account? <Text style={{ color: '#14b8a6', fontWeight: 'bold' }}>Login</Text></Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
          <Footer showFullCredits={false} />
        </View>
      </LinearGradient>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#14b8a6',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#e0e7ef',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#f3f6fa',
    color: '#222',
  },
  button: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#0e9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  error: {
    color: '#fb7185',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  linkBtn: {
    marginTop: 8,
  },
  linkText: {
    color: '#555',
    fontSize: 15,
    textAlign: 'center',
  },
});