import * as Yup from 'yup';
import Collection from '../models/Collection';
import Theme from '../models/Theme';

import errorMessage from './errorMessage';

const checkCollection = async id => {
  return !!(await Collection.findByPk(id));
};

const checkTheme = async id => {
  return !!(await Theme.findByPk(id));
};

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      number: Yup.number()
        .nullable()
        .min(0)
        .max(999)
        .transform((value, originalValue) =>
          originalValue === '' || null ? null : value
        ),
      title: Yup.string()
        .min(3)
        .required(),
      collection_id: Yup.number()
        .required()
        .test('collection', '${path} não existe', value =>
          checkCollection(value)
        ),
      theme_id: Yup.number()
        .required()
        .test('theme', '${path} não existe', value => checkTheme(value)),
      tone: Yup.string()
        .min(1)
        .required(),
      lyrics: Yup.string()
        .min(5)
        .required(),
      chords: Yup.string(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation failed', messages: errorMessage(err) });
  }
};
