const fs = require('fs');

const TEMPLATES_FOLDER = `${__dirname}/../templates`;

const replaceKeyWithValue = (propertyBag, content, key) => {
  const pattern = new RegExp(`__${key}__`, 'g');
  return content.replace(pattern, propertyBag[key]);
};

const loadTemplate = (templateFileName, propertyBag) => {
  const path = `${TEMPLATES_FOLDER}/${templateFileName}`;
  const content = fs.readFileSync(path, 'utf8');
  const keys = Object.keys(propertyBag);
  return keys.reduce(replaceKeyWithValue.bind(null, propertyBag), content);
};

module.exports = { loadTemplate };
