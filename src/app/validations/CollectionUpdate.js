import * as Yup from 'yup';
import errorMessage from './errorMessage';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().min(3),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation failed', messages: errorMessage(err) });
  }
};
