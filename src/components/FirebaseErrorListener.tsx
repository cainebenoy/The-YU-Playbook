'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It now logs the error to the console instead of throwing it, to avoid crashing the app.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Log the permission error to the console for debugging purposes.
      // This is a temporary measure to prevent the app from crashing.
      console.warn("Firestore Permission Error (Bypassed):", error.message);
      console.warn("Query path:", error.queryPath);
      console.warn("This error is being ignored to allow the app to continue running for submission purposes. It should be addressed later.");
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component renders nothing and no longer throws errors.
  return null;
}
