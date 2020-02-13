import * as Yup from 'yup';
import Sequelize from 'sequelize';
import errorMessage from './errorMessage';
import User from '../models/User';

const checkUser = async email => {
  return !(await User.findOne({
    where: { email: { [Sequelize.Op.iLike]: email } },
  }));
};

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required()
        .test('email', '${path} já está sendo utilizado', value =>
          checkUser(value)
        ),
      password: Yup.string()
        .required()
        .min(6),
      password_confirmation: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation failed', messages: errorMessage(err) });
  }
};
