export {
  signInWithGoogle,
  handleGoogleLogin,
  performGoogleSignIn,
  useCheckRedirectLogin,
  getPostLoginRedirectTarget,
  setPostLoginRedirectTarget,
  sanitizeRedirectUrl,
  getGoogleAuthProvider,
  mapAuthErrorMessage,
  isMobileDevice,
  performLogout,
  logoutUser,
  createNewUserDocument,
} from '@/lib/auth-helpers'

export {
  registerUserSession,
  getLocalSessionId,
  setLocalSessionId,
  clearLocalSession,
  terminateLocalSession,
  isSessionValid,
  validateSessionWithServer,
  getOrCreateDeviceId,
  isSessionTerminated,
  ACTIVE_SESSION_STORAGE_KEY,
  SESSION_CONFLICT_MESSAGE_KEY,
} from '@/lib/session-manager'



