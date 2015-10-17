import Joi from 'joi'

export default Joi.string().alphanum().min(1).max(30).regex(/^[$A-Z_][0-9A-Z_$]*$/i);