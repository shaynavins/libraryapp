import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function signup() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const signup = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.replace('/');
        } catch(err: any) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
          <Text style={styles.heading}>Sign Up</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Sign Up" onPress={signup} />
        </View>
      );
}

const styles = StyleSheet.create({
    container: { padding: 30, flex: 1, justifyContent: 'center' },
    heading: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderBottomWidth: 1, marginBottom: 20, padding: 10 },
    error: { color: 'red', textAlign: 'center' },
  });