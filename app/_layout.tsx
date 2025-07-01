import { auth } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { isSignInWithEmailLink, onAuthStateChanged, signInWithEmailLink } from 'firebase/auth';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

function useMagicLinkHandler() {
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

export default function RootLayout() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(!user) {
        router.replace('/(tabs)');
      }
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  useMagicLinkHandler();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="login" options={{ headerShown: false }} />

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
/* 
// app/_layout.tsx
import { Slot, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function RootLayout() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('../login');
      }
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
}
*/