
// This function is intended to be used on the client-side.
// Do not use it in server-side code.
export const getFirebaseConfig = () => {
  // We need to use process.env to access environment variables in Next.js
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Basic validation to ensure all required fields are present
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    // In a real app, you might want to throw an error or handle this more gracefully.
    // For now, we'll log a warning.
    console.warn(
      'Firebase configuration is missing or incomplete. Please check your environment variables.'
    );
    return null;
  }
  
  // Measurement ID is optional
  if (!firebaseConfig.measurementId) {
    console.info('Firebase Measurement ID is not provided. Google Analytics will be disabled.');
  }

  return firebaseConfig;
};
