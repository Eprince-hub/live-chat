import React from 'react';
import Svg, { Rect, Circle, Polygon } from 'react-native-svg';

export default function OnboardingImage1() {
  return (
    <Svg width="200" height="200" viewBox="0 0 200 200">
      <Rect x={40} y={60} width={120} height={80} rx={10} fill="#493d8a" />
      <Circle cx={100} cy={100} r={20} fill="#fff" />
      <Polygon points="95,90 110,100 95,110" fill="#493d8a" />
    </Svg>
  );
} 