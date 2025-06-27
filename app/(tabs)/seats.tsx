import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import InteractiveSeatMap from '../../components/InteractiveSeatMap';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Library Seat Map</Text>
      <InteractiveSeatMap />
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
