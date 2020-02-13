import * as Yup from 'yup';
import errorMessage from './errorMessage';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        )
        .test('password', 'Deve ter ao menos 6 caracteres', value => {
          if (value) {
            const schem = Yup.string().min(6);
            return schem.isValidSync(value);
          }
          return true;
        }),
      password_confirmation: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required()
              .oneOf(
                [Yup.ref('password')],
                'Confirmação deve ser igual a senha'
              )
          : field
      ),
      active: Yup.boolean(),
      admin: Yup.boolean(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation failed', messages: errorMessage(err) });
  }
};
