//////////////////////////////////
/////     theme switcher     /////
//////////////////////////////////

const root = document.documentElement;
const toggleThemeBtn = document.querySelector('.toggle-theme-btn');
const darkIcon = document.querySelector('.dark-icon');
const lightIcon = document.querySelector('.light-icon');

toggleThemeBtn.addEventListener('click', ()=>setTheme('click'));

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
}

const savedTheme = localStorage.getItem('theme');
if (!savedTheme) {
  root.dataset.theme = getSystemTheme();
} else {
  root.dataset.theme = savedTheme;
}

function setTheme(initial) {
  const currentTheme = root.dataset.theme;
  let newTheme = currentTheme; // temporary value

  if(initial !== 'initial') {
    if(currentTheme === 'dark') {
      newTheme = 'light';
      lightIcon.classList.add('hidden');
      darkIcon.classList.remove('hidden');
    } else if(currentTheme === 'light') {
      newTheme = 'dark';
      lightIcon.classList.remove('hidden');
      darkIcon.classList.add('hidden');
    }
  } else {
    if(currentTheme === 'dark') {
      darkIcon.classList.add('hidden');
    } else if(currentTheme === 'light') {
      lightIcon.classList.add('hidden');
    }
  }

  root.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
}

// initial setup
setTheme('initial');
