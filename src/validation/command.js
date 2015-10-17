import Joi from 'joi';
import identifierConstraint from './identifier';
import httpVerbConstraint from './httpVerb';
import parameterConstraints from './parameter';

export default Joi.object().keys({
	name: identifierConstraint.required()
//,	method: Joi.alternatives().try(Joi.array().items(httpVerbConstraint),httpVerbConstraint)
,	description: Joi.string()
,	parameters: Joi.array().items(parameterConstraints).required()
,	optionalParameters: Joi.array().items(parameterConstraints)
,	append: Joi.boolean()
,	consume: Joi.alternatives().try(Joi.string(),Joi.boolean())
,	run: Joi.func()
})



