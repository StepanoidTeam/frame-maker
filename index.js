import {
  LINKEDIN_CLIENT_ID,
  LINKEDIN_REDIRECT_URI,
  LINKEDIN_SCOPE,
} from './env.js';

const loginButton = document.querySelector('.login-button');

loginButton.addEventListener('click', () => {
  window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${LINKEDIN_REDIRECT_URI}&scope=${LINKEDIN_SCOPE}`;
});
