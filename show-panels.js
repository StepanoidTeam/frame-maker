import { updateMask } from './scroll-mask-feature.js';

//////////////////////////////////////
/////     show / hide panels     /////
//////////////////////////////////////

function togglePanel(currentPanel, triggerBtn) {
  currentPanel.classList.toggle('hiddenPanel');
  checkCurrentLayout();
  btnSetup(currentPanel, triggerBtn);
  // mask refreshing
  updateMask($photoGallery, 'horizontal');
  updateMask($frameGallery, 'vertical');
}

$frameBtn.addEventListener('click', () => togglePanel($framePanel, $frameBtn));

$photoBtn.addEventListener('click', () => togglePanel($photoPanel, $photoBtn));

$settingsBtn.addEventListener('click', () =>
  togglePanel($settingsPanel, $settingsBtn)
);

function checkCurrentLayout() {
  if ($photoPanel.classList.contains('hiddenPanel')) {
    $framePanel.style.bottom = 'calc(var(--panel-gap)';
  } else {
    $framePanel.style.bottom =
      'calc(var(--panel-gap) + var(--panel-padding) + var(--photo-size) + var(--panel-padding) + var(--panel-gap))';
  }

  if ($settingsPanel.classList.contains('hiddenPanel')) {
    $photoPanel.style.right = 'calc(var(--panel-gap)';
  } else {
    $photoPanel.style.right =
      'calc(var(--panel-gap) + var(--right-panel-width) + var(--panel-gap))';
  }
}

function btnSetup(currentPanel, triggerBtn) {
  const panelIsHidden = !currentPanel.classList.contains('hiddenPanel');

  triggerBtn.classList.toggle('pressedBtn', panelIsHidden);
}

window.addEventListener('load', () => btnSetup($framePanel, $frameBtn));
window.addEventListener('load', () => btnSetup($photoPanel, $photoBtn));
window.addEventListener('load', () => btnSetup($settingsPanel, $settingsBtn));
