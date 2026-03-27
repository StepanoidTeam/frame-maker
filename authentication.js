import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { app } from './firebase-config.js';

const auth = getAuth(app);

// Modal Elements
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginBtn = document.getElementById('loginBtn');
const createAccountBtn = document.getElementById('createAccountBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Forms
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Form inputs
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const signupConfirmPasswordInput = document.getElementById(
  'signupConfirmPassword',
);

// Form Toggle Links
const switchToSignupLink = document.getElementById('switchToSignup');
const switchToLoginLink = document.getElementById('switchToLogin');
const resetPasswordLink = document.getElementById('resetPasswordLink');

// Update UI based on auth state
// Track current user
export let currentUser = null;

// Update UI based on auth state
const updateAuthUI = (user) => {
  if (user) {
    // User is logged in
    loginBtn.style.display = 'none';
    createAccountBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    currentUser = user;
  } else {
    // User is logged out
    loginBtn.style.display = 'block';
    createAccountBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    currentUser = null;
  }
};

// Modal Functions
const openAuthModal = (isSignup = false) => {
  authModal.classList.remove('hidden');
  if (isSignup) {
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
  } else {
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
  }
};

const closeModal = () => {
  authModal.classList.add('hidden');
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
  // Clear forms
  loginEmailInput.value = '';
  loginPasswordInput.value = '';
  signupEmailInput.value = '';
  signupPasswordInput.value = '';
  signupConfirmPasswordInput.value = '';
};

// Event Listeners for Modal Toggle
loginBtn.addEventListener('click', () => openAuthModal(false));
createAccountBtn.addEventListener('click', () => openAuthModal(true));
closeAuthModal.addEventListener('click', closeModal);

// Close modal when clicking overlay
authModal.addEventListener('click', (e) => {
  if (e.target === authModal) {
    closeModal();
  }
});

// Form Toggle Links
switchToSignupLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.remove('active');
  signupForm.classList.add('active');
});

switchToLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.classList.remove('active');
  loginForm.classList.add('active');
});

// Login Handler
const loginHandler = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginEmailInput.value,
      loginPasswordInput.value,
    );
    console.log('User logged in:', userCredential);
    closeModal();
  } catch (error) {
    console.error('Error during login:', error);
    alert('Login failed: ' + error.message);
  }
};

// Sign Up Handler
const signUpHandler = async (e) => {
  e.preventDefault();

  if (signupPasswordInput.value !== signupConfirmPasswordInput.value) {
    alert('Passwords do not match');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      signupEmailInput.value,
      signupPasswordInput.value,
    );
    console.log('User signed up:', userCredential);
    closeModal();
  } catch (error) {
    console.error('Error during sign up:', error);
    alert('Sign up failed: ' + error.message);
  }
};

// Reset Password Handler
const resetPasswordHandler = async (e) => {
  e.preventDefault();

  const email = loginEmailInput.value.trim();
  if (!email) {
    alert('Please enter your email in the login form first.');
    loginEmailInput.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert('Password reset email sent. Please check your inbox.');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    alert('Password reset failed: ' + error.message);
  }
};

loginForm.addEventListener('submit', loginHandler);
signupForm.addEventListener('submit', signUpHandler);
resetPasswordLink.addEventListener('click', resetPasswordHandler);

// Logout Handler
const logoutHandler = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Error during logout:', error);
    alert('Logout failed: ' + error.message);
  }
};

logoutBtn.addEventListener('click', logoutHandler);

// Monitor auth state changes
onAuthStateChanged(auth, (user) => {
  updateAuthUI(user);
});
