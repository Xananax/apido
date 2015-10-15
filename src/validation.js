import Joi from 'joi'
import Promise from 'bluebird';

const identifierConstraint = Joi.string().alphanum().min(2).max(30).regex(/^[$A-Z_][0-9A-Z_$]*$/i);
const httpVerbConstraint = Joi.string().regex(/get|post|delete|put/);

const argConstraints = Joi.object().keys({
	name: identifierConstraint.required()
,	alias:Joi.string()
,	description: Joi.string()
,	default: Joi.any()
,	valid: Joi.alternatives().try(Joi.string(),Joi.array(),Joi.object())
,	validate: Joi.func()
,	coerce: Joi.func()
});

const methodConstraints  = Joi.object().keys({
	name: identifierConstraint.required()
,	method: Joi.alternatives().try(Joi.array().items(httpVerbConstraint),httpVerbConstraint)
,	description: Joi.string()
,	args: Joi.array().items(argConstraints).required()
,	optionalArgs: Joi.array().items(argConstraints)
,	append: Joi.boolean()
,	consume: Joi.alternatives().try(Joi.string(),Joi.boolean())
,	run: Joi.func()
})

const apiConstrainst = Joi.object().keys({
	name: identifierConstraint.required()
,	description: Joi.string()
,	default: identifierConstraint
,	key: identifierConstraint
,	methods:Joi.array().items(methodConstraints)
})

const validAPI = Promise.promisify(function validAPI(props,cb){
	Joi.validate(props,apiConstrainst,cb);
})

const validMethod = Promise.promisify(function validMethod(props,cb){
	Joi.validate(props,methodConstraints,cb);
})

const validArg = Promise.promisify(function validArg(props,cb){
	Joi.validate(props,argConstraints,cb);
});

export {
	validAPI
,	validMethod
,	validArg
}