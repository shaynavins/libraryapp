import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FooterProps {
  showFullCredits?: boolean;
}

export default function Footer({ showFullCredits = true }: FooterProps) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Built by <Text style={styles.highlight}>Shayna Vinoth</Text>
      </Text>
      {showFullCredits && (
        <Text style={styles.footerText}>
          Map illustration: <Text style={styles.highlight}>Kashish Mehta</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#f6f6f6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#18181b',
    textAlign: 'center',
    lineHeight: 20,
  },
  highlight: {
    color: '#18181b',
    fontWeight: '600',
  },
}); 