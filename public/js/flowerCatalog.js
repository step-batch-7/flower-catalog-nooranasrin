const hide = function() {
  const target = event.target;
  target.style.visibility = 'hidden';
  setTimeout(() => (target.style.visibility = 'visible'), 1000);
};
