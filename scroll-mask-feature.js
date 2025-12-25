/////////////////////////////////////////
/////     dynamic mask gradient     /////
/////////////////////////////////////////

export function updateMask(scrollableElement, verticalOrHorizontal) {
  let scrollTop = scrollableElement.scrollTop; // расстояние от верха прокрученное
  let scrollHeight = scrollableElement.scrollHeight; // полная высота контента
  let clientHeight = scrollableElement.clientHeight; // видимая высота "окна"

  let gradientAxis = 'to bottom';
  if(verticalOrHorizontal === 'horizontal') {
    scrollTop = scrollableElement.scrollLeft;
    scrollHeight = scrollableElement.scrollWidth;
    clientHeight = scrollableElement.clientWidth;
    gradientAxis = 'to right';
  }

  const isAtTop = scrollTop <= 0;
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

  let gradient = '';

  if (isAtTop && isAtBottom) {
    // всё помещается и скролл не нужен, его нет у блока
    gradient = "none";
    console.log(`no effect - ${scrollableElement.id}`);
  } else if (isAtTop) {
    // Только нижняя тень
    console.log('top');
    gradient = `linear-gradient(${gradientAxis}, black 0%, black calc(100% - 1rem), transparent 100%)`;
  } else if (isAtBottom) {
    // Только верхняя тень
    console.log('bottom');
    gradient = `linear-gradient(${gradientAxis}, transparent 0%, black 1rem, black 100%)`;
  } else {
    // Верх и низ
    console.log('middle');
    gradient = `linear-gradient(${gradientAxis}, transparent 0%, black 1rem, black calc(100% - 1rem), transparent 100%)`;
  }

  scrollableElement.style.maskImage = gradient;
  scrollableElement.style.webkitMaskImage = gradient;
  // console.log('mask');
}

$frameGallery.addEventListener('scroll', ()=>updateMask($frameGallery, 'vertical'));
window.addEventListener('load', ()=>updateMask($frameGallery, 'vertical')); // чтоб обновляло маску при загрузке
window.addEventListener('resize', ()=>updateMask($frameGallery, 'vertical')); // чтоб обновляло маску при изменении размера окна тоже

$photoGallery.addEventListener('scroll', ()=>updateMask($photoGallery, 'horizontal'));
window.addEventListener('load', ()=>updateMask($photoGallery, 'horizontal')); // чтоб обновляло маску при загрузке
window.addEventListener('resize', ()=>updateMask($photoGallery, 'horizontal')); // чтоб обновляло маску при изменении размера окна тоже

$dynamicControlsContainer.addEventListener('scroll', ()=>updateMask($dynamicControlsContainer, 'vertical'));
window.addEventListener('load', ()=>updateMask($dynamicControlsContainer, 'vertical')); // чтоб обновляло маску при загрузке
window.addEventListener('resize', ()=>updateMask($dynamicControlsContainer, 'vertical')); // чтоб обновляло маску при изменении размера окна тоже
$frameGallery.addEventListener('click', ()=>updateMask($dynamicControlsContainer, 'vertical')); // чтоб обновляло маску при клике на галерею рамок