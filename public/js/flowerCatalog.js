const hide = function() {
  const flowerJar = event.target.src;
  event.target.src = '';
  setTimeout(event => (event.target.src = flowerJar), 1000, event);
};
