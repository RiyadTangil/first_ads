// Map of error codes to user-friendly messages
export const authErrors = {
  // NextAuth built-in errors
  Signin: 'Try signing in with a different account.',
  OAuthSignin: 'Try signing in with a different account.',
  OAuthCallback: 'Try signing in with a different account.',
  OAuthCreateAccount: 'Try signing in with a different account.',
  EmailCreateAccount: 'Try signing in with a different account.',
  Callback: 'Try signing in with a different account.',
  OAuthAccountNotLinked: 'To confirm your identity, sign in with the same account you used originally.',
  EmailSignin: 'Check your email address.',
  CredentialsSignin: 'Invalid email or password.',
  SessionRequired: 'Please sign in to access this page.',
  
  // Custom auth errors
  UserNotFound: 'No user found with this email address.',
  InvalidCredentials: 'Invalid email or password.',
  PasswordsDoNotMatch: 'The passwords you entered do not match.',
  EmailAlreadyInUse: 'An account with this email already exists.',
  InvalidToken: 'Invalid or expired token.',
  ServerError: 'An error occurred on the server. Please try again later.',
  
  // Generic error
  Default: 'An unknown error occurred. Please try again.',
};

/**
 * Gets a user-friendly error message from an error code
 */
export function getAuthErrorMessage(errorCode: string | undefined): string {
  if (!errorCode) return authErrors.Default;
  
  // Check if we have a specific message for this error code
  return authErrors[errorCode as keyof typeof authErrors] || authErrors.Default;
} 