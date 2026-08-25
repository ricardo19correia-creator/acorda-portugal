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
} from '@/lib/session-manager'
