/////////////////////////////////////////
/////     dynamic mask gradient     /////
/////////////////////////////////////////

function updateMask(scrollableElement) {
  const scrollTop = scrollableElement.scrollTop; // расстояние от верха прокрученное
  const scrollHeight = scrollableElement.scrollHeight; // полная высота контента
  const clientHeight = scrollableElement.clientHeight; // видимая высота "окна"

  const isAtTop = scrollTop <= 0;
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

  let gradient = '';

  if (isAtTop && isAtBottom) {
    // всё помещается и скролл не нужен, его нет у блока
    gradient = "none";
  } else if (isAtTop) {
    // Только нижняя тень
    console.log('top');
    gradient = `linear-gradient(to bottom, black 0%, black calc(100% - 1rem), transparent 100%)`;
  } else if (isAtBottom) {
    // Только верхняя тень
    console.log('bottom');
    gradient = `linear-gradient(to bottom, transparent 0%, black 1rem, black 100%)`;
  } else {
    // Верх и низ
    console.log('middle');
    gradient = `linear-gradient(to bottom, transparent 0%, black 1rem, black calc(100% - 1rem), transparent 100%)`;
  }

  scrollableElement.style.maskImage = gradient;
  scrollableElement.style.webkitMaskImage = gradient;
}

$frameGallery.addEventListener('scroll', ()=>updateMask($frameGallery));

window.addEventListener('load', ()=>updateMask($frameGallery)); // бесполезное, но пусть будет...
window.addEventListener('resize', ()=>updateMask($frameGallery)); // чтоб обновляло маску при изменении размера окна тоже