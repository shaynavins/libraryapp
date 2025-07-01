import axios from 'axios';
import { useRouter } from 'expo-router';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const BG_COLOR = '#f8f5ee';
const CARD_COLOR = '#fff';
const BORDER_COLOR = '#e5e5e5';
const TEXT_COLOR = '#18181b';
const BUTTON_COLOR = '#18181b';
const SUBTEXT_COLOR = '#6b7280';

const BACKEND_URL = '/.netlify/functions'; // Use Netlify Functions endpoints

export default function EmailOTPAuth() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const router = useRouter();
  const auth = getAuth();

  const sendOTP = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await axios.post(`${BACKEND_URL}/send-otp`, { email });
      setInfo('OTP sent! Check your email.');
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await axios.post(`${BACKEND_URL}/verify-otp`, { email, code: otp });
      // Get Firebase custom token from backend
      const response = await axios.post(`${BACKEND_URL}/get-firebase-token`, { email });
      const { token } = response.data;
      await signInWithCustomToken(auth, token);
      setInfo('OTP verified! You are logged in.');
      setTimeout(() => {
        router.replace('/seats');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
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
            <Text style={styles.heading}>Sign In</Text>
            {step === 'email' ? (
              <>
                <Text style={styles.subheading}>Enter your email to receive an OTP</Text>
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
                {info ? <Text style={styles.info}>{info}</Text> : null}
                <Pressable style={styles.button} onPress={sendOTP} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.subheading}>Enter the OTP sent to your email</Text>
                <TextInput
                  placeholder="OTP"
                  value={otp}
                  onChangeText={setOTP}
                  style={styles.input}
                  keyboardType="numeric"
                  placeholderTextColor={SUBTEXT_COLOR}
                  maxLength={6}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                {info ? <Text style={styles.info}>{info}</Text> : null}
                <Pressable style={styles.button} onPress={verifyOTP} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
                </Pressable>
                <Pressable style={styles.linkBtn} onPress={() => setStep('email')}>
                  <Text style={styles.linkText}>Back to Email</Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
    textAlign: 'center',
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
    textAlign: 'center',
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
  info: {
    color: '#22c55e',
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