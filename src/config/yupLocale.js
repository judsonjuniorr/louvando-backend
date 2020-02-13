/* eslint-disable no-template-curly-in-string */

export default {
  mixed: {
    default: '${path} é inválido',
    required: '${path} é obrigatório',
  },
  string: {
    length: '${path} deve ter exatamente ${length} caracteres',
    min: '${path} deve ter ao menos ${min} caracteres',
    max: '${path} por ter no máximo ${max} caracteres',
    matches: '${path} deve corresponder ao seguinte: "${regex}"',
    email: '${path} deve ser um email válido',
    url: '${path} deve ser um URL válido',
    trim: '${path} deve ser uma string aparada',
    lowercase: '${path} deve ser uma string em minúscula',
    uppercase: '${path} deve ser uma string maiúscula',
  },
  number: {
    min: '${path} deve ser maior ou igual a ${min}',
    max: '${path} deve ser menor ou igual a ${max}',
    lessThan: '${path} deve ser menor que ${less}',
    moreThan: '${path} deve ser maior que ${more}',
    positive: '${path} deve ser um número positivo',
    negative: '${path} deve ser um número negativo',
    integer: '${path} deve ser um inteiro',
  },
  date: {
    min: '${path} deve ser posterior a ${min}',
    max: '${path} deve ser mais cedo do que ${max}',
  },
  object: {
    noUnknown:
      '${path} não pode ter chaves não especificadas na forma do objeto',
  },
  array: {
    min: '${path} deve ter ao menos ${min} items',
    max: '${path} deve ter no máximo ${max} items',
  },
};
