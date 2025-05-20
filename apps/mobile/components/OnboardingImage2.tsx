import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export default function OnboardingImage2() {
  return (
    <Svg width="200" height="200" viewBox="0 0 200 200">
      <Rect x={40} y={40} width={120} height={120} rx={10} fill="#493d8a" />
      <Rect x={50} y={60} width={100} height={20} rx={5} fill="#fff" />
      <Rect x={50} y={90} width={100} height={20} rx={5} fill="#fff" />
      <Rect x={50} y={120} width={60} height={20} rx={5} fill="#fff" />
    </Svg>
  );
} 