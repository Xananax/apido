import Joi from 'joi'

export default Joi.string().regex(/get|post|delete|put/);