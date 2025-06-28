import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import Footer from '../../components/Footer';
import InteractiveSeatMap from '../../components/InteractiveSeatMap';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.heading}>Library Seat Map</Text>
        <InteractiveSeatMap />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
});
