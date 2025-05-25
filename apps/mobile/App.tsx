import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@shopify/restyle';
import { store } from './src/store';
import { theme } from '@live-chat/ui';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.buttonPrimary,
            },
            headerTintColor: theme.colors.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  );
} 