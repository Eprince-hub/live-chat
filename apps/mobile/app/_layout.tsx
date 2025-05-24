import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store';

export default function Layout() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
} 