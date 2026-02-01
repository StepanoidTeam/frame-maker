function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
} else {
  document.documentElement.dataset.theme = getSystemTheme();
}
