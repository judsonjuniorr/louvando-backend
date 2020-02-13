import * as Yup from 'yup';
import Sequelize from 'sequelize';
import errorMessage from './errorMessage';
import Theme from '../models/Theme';

const checkName = async name => {
  return !(await Theme.findOne({
    where: {
      name: { [Sequelize.Op.iLike]: name },
    },
  }));
};

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string()
        .min(3)
        .test('nome', '${path} já está sendo utilizado', value =>
          checkName(value)
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
