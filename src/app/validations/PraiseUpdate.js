import * as Yup from 'yup';
import _ from 'lodash';
import Collection from '../models/Collection';
import Theme from '../models/Theme';

import errorMessage from './errorMessage';

const checkCollection = async id => {
  if (!id) return true;
  return !!(await Collection.findByPk(id));
};

const checkTheme = async id => {
  if (!id) return true;
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
      title: Yup.string().min(3),
      collection_id: Yup.number().test(
        'collection',
        '${path} não existe',
        value => checkCollection(value)
      ),
      theme_id: Yup.number().test('theme', '${path} não existe', value =>
        checkTheme(value)
      ),
      tone: Yup.string().min(1),
      lyrics: Yup.string().min(5),
      chords: Yup.string(),
    });

    await schema.validate(_.pickBy(req.body, _.identity), {
      abortEarly: false,
    });

    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation failed', messages: errorMessage(err) });
  }
};
