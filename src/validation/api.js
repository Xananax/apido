import Joi from 'joi'
import identifierConstraint from './identifier';
import commandConstraints from './command';

export default Joi.object().keys({
	name: identifierConstraint.required()
,	description: Joi.string()
,	default: identifierConstraint
,	key: identifierConstraint
,	commands:Joi.array().items(commandConstraints)
})