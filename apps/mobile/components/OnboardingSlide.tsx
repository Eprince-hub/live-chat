import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type OnboardingSlideProps = {
  title: string;
  description: string;
  image: React.ComponentType;
};

export default function OnboardingSlide({ title, description, image: Image }: OnboardingSlideProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.imageContainer}>
        <Image />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 0.3,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 10,
    color: '#493d8a',
    textAlign: 'center',
  },
  description: {
    fontWeight: '300',
    color: '#62656b',
    textAlign: 'center',
    paddingHorizontal: 64,
    fontSize: 16,
  },
}); 