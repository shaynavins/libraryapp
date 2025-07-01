import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Footer from '../../components/Footer';
import { auth } from '../../firebaseConfig';

const BG_COLOR = '#f8f5ee';
const CARD_COLOR = '#fff';
const BORDER_COLOR = '#e5e5e5';
const TEXT_COLOR = '#18181b';
const BUTTON_COLOR = '#18181b';
const SUBTEXT_COLOR = '#6b7280';

const actionCodeSettings = {
  url: Linking.createURL('finishSignIn'), // e.g., yourapp://finishSignIn
  handleCodeInApp: true,
};

export async function sendMagicLink(email: string) {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  await AsyncStorage.setItem('emailForSignIn', email);
  alert('Check your email for the magic link!');
}

export function useMagicLinkHandler() {
  const router = useRouter();
  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const url = event.url;
      if (isSignInWithEmailLink(auth, url)) {
        const email = await AsyncStorage.getItem('emailForSignIn');
        if (email) {
          await signInWithEmailLink(auth, email, url);
          alert('Signed in successfully!');
          router.replace('./seats');
        } else {
          alert('No email found for sign-in.');
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && isSignInWithEmailLink(auth, initialUrl)) {
        const email = await AsyncStorage.getItem('emailForSignIn');
        if (email) {
          await signInWithEmailLink(auth, email, initialUrl);
          alert('Signed in successfully!');
          router.replace('./seats');
        }
      }
    })();

    return () => subscription.remove();
  }, []);
}

export default function signup() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useMagicLinkHandler();

  const handleMagicLink = async () => {
    setLoading(true);
    if (!email.endsWith('@hyderabad.bits-pilani.ac.in')) {
      setError('You must use your @hyderabad.bits-pilani.ac.in email to sign up.');
      setLoading(false);
      return;
    }
    try {
      await sendMagicLink(email);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG_COLOR }}>
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
              placeholderTextColor={SUBTEXT_COLOR}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={styles.button} onPress={handleMagicLink} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Sending link...' : 'Send Magic Link'}</Text>
            </Pressable>
            <Pressable style={styles.linkBtn} onPress={() => {/* Optionally navigate to login */} }>
              <Text style={styles.linkText}>Already have an account? <Text style={{ color: BUTTON_COLOR, fontWeight: 'bold' }}>Login</Text></Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
        <Footer showFullCredits={false} />
      </View>
    </View>
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
    backgroundColor: CARD_COLOR,
    borderRadius: 24,
    padding: 32,
    width: 350,
    shadowColor: 'transparent',
    elevation: 0,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 16,
    color: SUBTEXT_COLOR,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: CARD_COLOR,
    color: TEXT_COLOR,
  },
  button: {
    backgroundColor: BUTTON_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: 'transparent',
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  error: {
    color: '#f43f5e',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  linkBtn: {
    marginTop: 8,
  },
  linkText: {
    color: SUBTEXT_COLOR,
    fontSize: 15,
    textAlign: 'center',
  },
});