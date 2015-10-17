import apiConstrainst from './api';
import parameterConstraints from './parameter';
import commandConstraints from './command';
import Promise from 'bluebird';
import Joi from 'joi';

function validAPI(props,cb){
	Joi.validate(props,apiConstrainst,cb);
}

function validCommand(props,cb){
	Joi.validate(props,commandConstraints,cb);
}

function validParameter(props,cb){
	Joi.validate(props,parameterConstraints,cb);
}

export default {
	validAPI:Promise.promisify(validAPI)
,	validCommand:Promise.promisify(validCommand)
,	validParameter:Promise.promisify(validParameter)
}