import React from 'react';
import Svg, { Circle, Text, Path } from 'react-native-svg';

export default function OnboardingImage3() {
  return (
    <Svg width="200" height="200" viewBox="0 0 200 200">
      <Circle cx={100} cy={100} r={50} fill="#493d8a" />
      <Text x={85} y={90} fill="#fff" fontSize={24}>$</Text>
      <Path d="M100,60 L120,100 L100,140 L80,100 Z" fill="#fff" />
    </Svg>
  );
} 