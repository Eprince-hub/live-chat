import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@shopify/restyle';
import { store } from '../src/store';
import { theme } from '@live-chat/ui';

export default function Layout() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'Home',
            }}
          />
          <Stack.Screen
            name="auth/login"
            options={{
              title: 'Login',
            }}
          />
          <Stack.Screen
            name="auth/register"
            options={{
              title: 'Create Account',
            }}
          />
        </Stack>
      </ThemeProvider>
    </Provider>
  );
} 