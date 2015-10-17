import Joi from 'joi'
import identifierConstraint from './identifier';

export default Joi.object().keys({
	name: identifierConstraint.required()
,	alias:Joi.string()
,	description: Joi.string()
,	default: Joi.any()
,	valid: Joi.alternatives().try(Joi.string(),Joi.array(),Joi.object())
,	validate: Joi.func()
,	coerce: Joi.func()
});