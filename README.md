# Live Chat App

A real-time streaming and chat application built with React Native (mobile) and Express.js (API). This monorepo contains all the necessary components to run a full-featured live streaming platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- pnpm (v8 or later)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (available on [iOS App Store](https://apps.apple.com/app/apple-store/id982107779) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Git
- A code editor (e.g., VS Code)

## Project Structure

```bash
live-chat/
├── apps/
│   ├── api/         # Express.js backend
│   └── mobile/      # React Native mobile app
├── packages/
│   ├── types/       # Shared TypeScript types
│   └── ui/          # Shared UI components
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/live-chat.git
   cd live-chat
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   Create a `.env` file in the `apps/api` directory:

   ```env
   PORT=3000
   CORS_ORIGIN=*
   JWT_SECRET=your-secret-key
   DATABASE_URL="postgresql://user:password@localhost:5432/livechat?schema=public"
   ```

   Create a `.env` file in the `apps/mobile` directory:

   ```env
   API_URL=http://localhost:3000
   ```

4. Set up the database:
   ```bash
   cd apps/api
   pnpm prisma generate   # Generate Prisma client
   pnpm prisma db push    # Push the schema to your database
   ```

## Running the Application

### Start the API Server

1. Navigate to the API directory:

   ```bash
   cd apps/api
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3000`.

### Start the Mobile App

1. Navigate to the mobile app directory:

   ```bash
   cd apps/mobile
   ```

2. Start the Expo development server:

   ```bash
   pnpm dev
   ```

3. Running on your device:

   - Install the Expo Go app on your mobile device
   - Scan the QR code shown in the terminal with:
     - iOS: Use the Camera app
     - Android: Use the Expo Go app's QR scanner

4. Running on simulators:
   - iOS (requires macOS):
     ```bash
     pnpm ios
     ```
   - Android:
     ```bash
     pnpm android
     ```

## Testing the Authentication Flow

The app includes a complete authentication system. Here's how to test each feature:

1. **Onboarding**:

   - Launch the app
   - Swipe through the three onboarding screens
   - Use the "Skip" button to jump to the end
   - Tap "Get Started" to proceed to login

2. **Registration**:

   - From the login screen, tap "Don't have an account? Register"
   - Fill in the registration form:
     - Full Name
     - Email
     - Password
     - Confirm Password
   - Submit the form

3. **Email Verification**:

   - After registration, you'll be taken to the email verification screen
   - Check your email for the verification link
   - Use "Resend Verification Email" if needed

4. **Login**:

   - Enter your email and password
   - Tap "Login"
   - Use "Forgot Password?" if needed

5. **Password Reset**:

   - From the login screen, tap "Forgot Password?"
   - Enter your email address
   - Check your email for reset instructions
   - Follow the link to set a new password

6. **OTP Verification**:
   - When required (e.g., for two-factor authentication)
   - Enter the 6-digit code sent to your phone
   - Use "Resend Code" if needed

## Development Tools

### Mobile App

- React Native with Expo
- TypeScript for type safety
- Expo Router for navigation
- React Native SVG for vector graphics
- Socket.io Client for real-time communication

### API

- Express.js
- TypeScript
- Socket.io for WebSocket support
- JWT for authentication
- Cors for cross-origin resource sharing

## Common Issues and Solutions

1. **Metro bundler issues**:

   ```bash
   cd apps/mobile
   pnpm start --clear
   ```

2. **Android/iOS build errors**:

   ```bash
   cd apps/mobile
   pnpm install
   expo doctor
   ```

3. **API connection errors**:
   - Ensure your mobile device and API server are on the same network
   - Update the API_URL in the mobile app's .env file to match your local IP address

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the maintainers at:

- Email: support@livechat.com
- Twitter: @livechat

## Security

To report security vulnerabilities, please email security@livechat.com instead of using the public issue tracker.
