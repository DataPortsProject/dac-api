const { randomBytes } = require('crypto');

module.exports.randomString = function randomString(length, chars = 'a#') {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~!@%^&*()_+-{}[]:;<>?,.|';
  return Array.from(randomBytes(length))
    .map((index) => mask[index % mask.length])
    .join('');
};
