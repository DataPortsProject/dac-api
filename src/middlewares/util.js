import { validationResult } from 'express-validator';
import config from '../config/config';

export function languageParser(req, _res, next) {
  const defaultLang = config.const.LANG[0];
  if (req.headers['accept-language'] == null) {
    req.language = defaultLang;
  } else {
    req.language = req.acceptsLanguages(config.const.LANG);
    if (!req.language) {
      req.language = defaultLang;
    }
  }
  next();
  return null;
}

export function sendValidations(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
  return null;
}
