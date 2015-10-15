
const hasOwnProperty = Object.prototype.hasOwnProperty;
const assign = Object.assign;
const needsArgumentsStr = 'Arguments list cannot be empty'
import checkArg from './checkArg';
import isObjectEmpty from './isObjectEmpty';
import isPlainObject from './isPlainObject';

function getDefaultsArguments(args){
	const defaultArgs = {}
	args.forEach(arg=>{
		defaultArgs[arg.name] = arg.default || null;
	})
	return defaultArgs;
}

function checkArgumentsObject(props,args,checkRequired){
	const returnedObj = {};
	for(let name in args){
		if(!hasOwnProperty.call(args,name)){continue;}
		let given = props[name];
		let arg = args[name];
		let ret = checkArg(given,arg,checkRequired);
		returnedObj[name] = ret;
	}
	return returnedObj
}

function checkArgumentsArray(props,args,checkRequired,appendAdditionalProps,consumeProps){
	const {length} = args;
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
		let arg = args[i];
		let ret = checkArg(given,arg,checkRequired);
		returnedObj[arg.name] = ret;
		i++;
	}
	return returnedObj
}

export default function makeCheckArgumentsFunction(needsArguments,methodArguments,methodArgumentsByName,appendAdditionalProps,consumeProps){
	const defaultArgs = getDefaultsArguments(methodArguments)
	return function check(props,checkRequired,doNotAssign){
		const propsType = isPlainObject(props) ? 
			'object' : 
			Array.isArray(props) ? 
				'array' : 
				(props === null || (typeof props == 'undefined')) ? 
					'null' : 
					false
		;
		if(!propsType){
			throw new Error('argument object must be an object or an array');
		}
		if(propsType == 'null'){
			if(checkRequired && needsArguments){
				throw new Error(needsArgumentsStr)
			}
			return doNotAssign ? null : defaultArgs;
		}		
		if(propsType == 'array'){
			if(!props.length && checkRequired){
				if(needsArguments){
					throw Error(needsArgumentsStr)
				}
				return doNotAssign ? null : defaultArgs;
			}
			return checkArgumentsArray(props,methodArguments,false,appendAdditionalProps,consumeProps);
		}
		if(isObjectEmpty(props) && checkRequired){
			if(needsArguments){
				throw new Error(needsArgumentsStr);
			}
			return doNotAssign ? null : defaultArgs;
		}
		return checkArgumentsObject(props,methodArgumentsByName);
	}
}
