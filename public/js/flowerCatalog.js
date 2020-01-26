const hide = function() {
  const flowerJar = event.target.src;
  event.target.src = '';
  setTimeout(event => (event.target.src = flowerJar), 1000, event);
};

const createTd = function(value, tr) {
  let td = document.createElement('td');
  const text = value.split('+').join(' ');
  td.innerText = text;
  tr.appendChild(td);
  return tr;
};

const showUserFeedback = function() {
  const table = document.getElementById('feedback');
  feedbacks.forEach(feedback => {
    let tr = document.createElement('tr');
    tr = createTd(feedback.date, tr);
    tr = createTd(feedback.time, tr);
    tr = createTd(feedback.name, tr);
    tr = createTd(feedback.comment, tr);
    table.appendChild(tr);
  });
};
