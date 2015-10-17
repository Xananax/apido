
const hasOwnProperty = Object.prototype.hasOwnProperty;
const assign = Object.assign;
const needsParametersStr = 'Parameters list cannot be empty'
import checkAndCoerceParameter from './utils/checkAndCoerceParameter';
import isObjectEmpty from '../utils/isObjectEmpty';
import isPlainObject from '../utils/isPlainObject';

function getDefaultsParameters(parameters){
	const defaultParameters = {}
	parameters.forEach(parameter=>{
		defaultParameters[parameter.name] = parameter.default || null;
	})
	return defaultParameters;
}

function checkAndCoerceParametersObject(props,parameters,checkRequired){
	const returnedObj = {};
	for(let name in parameters){
		if(!hasOwnProperty.call(parameters,name)){continue;}
		let given = props[name];
		let parameter = parameters[name];
		let ret = checkAndCoerceParameter(given,parameter,checkRequired);
		returnedObj[name] = ret;
	}
	return returnedObj
}

function checkAndCoerceParametersArray(props,parameters,checkRequired,appendAdditionalProps,consumeProps){
	const {length} = parameters;
	var i = 0;
	const returnedObj = {}
	if(consumeProps){
		let char = consumeProps;
		let parsedProps = [];
		let temp = [];
		if(char === true){
			parsedProps = [props];
		}
		else{
			props.forEach(prop=>{
				if(typeof prop == 'string' && prop.indexOf(char)>=0){
					let els = prop.split(char);
					temp = temp.concat(els[0]);
					els = els.slice(1);
					parsedProps.push(temp.filter(Boolean))
					temp = []
					if(els.length>1){
						parsedProps.push(els.filter(Boolean))
					}else if(els.length){
						temp.push(els[0]);
					}
				}else{
					temp.push(prop);
				}
			})
			if(temp.length){parsedProps.push(temp);}
		}
		props = parsedProps
	}
	if(appendAdditionalProps && props.length>length-1){
		props = props.slice(0,length-1).concat([props.slice(length-1)])
	}
	while(i<length){
		let given = props[i];
		let parameter = parameters[i];
		let ret = checkAndCoerceParameter(given,parameter,checkRequired);
		returnedObj[parameter.name] = ret;
		i++;
	}
	return returnedObj
}

export default function commandParametersCheckerFactory(needsParameters,commandParameters,commandParametersByName,appendAdditionalProps,consumeProps){
	const defaultParameters = getDefaultsParameters(commandParameters)
	return function checkAndCoerceParameters(props,checkRequired,doNotAssign){
		const propsType = isPlainObject(props) ? 
			'object' : 
			Array.isArray(props) ? 
				'array' : 
				(props === null || (typeof props == 'undefined')) ? 
					'null' : 
					false
		;
		if(!propsType){
			throw new Error('parameters object must be an object or an array');
		}
		if(propsType == 'null'){
			if(checkRequired && needsParameters){
				throw new Error(needsParametersStr)
			}
			return doNotAssign ? null : defaultParameters;
		}		
		if(propsType == 'array'){
			if(!props.length && checkRequired){
				if(needsParameters){
					throw Error(needsParametersStr)
				}
				return doNotAssign ? null : defaultParameters;
			}
			return checkAndCoerceParametersArray(props,commandParameters,false,appendAdditionalProps,consumeProps);
		}
		if(isObjectEmpty(props) && checkRequired){
			if(needsParameters){
				throw new Error(needsParametersStr);
			}
			return doNotAssign ? null : defaultParameters;
		}
		return checkAndCoerceParametersObject(props,commandParametersByName);
	}
}
