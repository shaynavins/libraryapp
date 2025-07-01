import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Footer from '../../components/Footer';
import InteractiveSeatMap from '../../components/InteractiveSeatMap';
import { auth } from '../../firebaseConfig';

const BG_COLOR = '#edd9bc';
const BUTTON_COLOR = '#18181b';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('./');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.heading}>Library Seat Map</Text>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <InteractiveSeatMap />
          <Footer />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: BG_COLOR,
    paddingTop: 30,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: BUTTON_COLOR,
    borderRadius: 8,
    marginLeft: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
