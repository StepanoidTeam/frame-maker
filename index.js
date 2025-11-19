const loginButton = document.querySelector('.login-button');

// TODO: Replace with your actual LinkedIn OAuth credentials
const LINKEDIN_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const LINKEDIN_REDIRECT_URI = 'http://127.0.0.1:5500/';
const LINKEDIN_SCOPE = 'YOUR_SCOPE_HERE';

loginButton.addEventListener('click', () => {
  window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${LINKEDIN_REDIRECT_URI}&scope=${LINKEDIN_SCOPE}`;
});
