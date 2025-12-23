const toggleThemeBtn = document.querySelector('.toggle-theme-btn');
const darkIcon = document.querySelector('.dark-icon');
const lightIcon = document.querySelector('.light-icon');

toggleThemeBtn.addEventListener('click', ()=>setTheme('click'));

function setTheme(initial) {
  const currentTheme = document.documentElement.getAttribute('theme');
  let newTheme = '';

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
      newTheme = 'dark';
      darkIcon.classList.add('hidden');
    } else if(currentTheme === 'light') {
      newTheme = 'light';
      lightIcon.classList.add('hidden');
    }
  }

  document.documentElement.setAttribute('theme', newTheme);
}

// initial setup
setTheme('initial');