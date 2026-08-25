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
} from '@/lib/auth-helpers'

export {
  registerUserSession,
  getLocalSessionId,
  setLocalSessionId,
  clearLocalSession,
} from '@/lib/session-manager'



