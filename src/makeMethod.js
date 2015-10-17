import Promise from 'bluebird';
import makeFunctionArgumentChecker from './makeFunctionArgumentChecker'
import methodToYargs from './methodToYargs';
import extend from 'node.extend';
import makeCallbackFunction from './makeCallbackFunction';
const assign = Object.assign;

function makeSummary(name,methodArgumentsSummary,methodOptionalArgumentsSummary){
	var str = name+'(';
	if(methodArgumentsSummary.length || methodOptionalArgumentsSummary.length){
		if(methodOptionalArgumentsSummary.length){
			methodArgumentsSummary.push('['+methodOptionalArgumentsSummary.join(',')+']');
		}
		if(methodArgumentsSummary.length){
			str+=methodArgumentsSummary.join(',');
		}
	}
	str+=')';
	return str;
}

export default function makeMethod(methodProps,apiName){
	const {name,method,description,args,optionalArgs,run,append,consume} = methodProps;
	const methodArgumentsByName = {};
	const methodArgumentsSummary = [];
	const methodOptionalArgumentsSummary = [];
	const methodArgumentsHelp = {};
	var needsArguments = false;
	const methodArguments = []
		.concat(
			args && args.map(arg=>assign({},arg,{required:true}))
		,	optionalArgs && optionalArgs.map(arg=>Object.assign({},arg,{required:false}))
		)
		.filter(Boolean)
		.map((_arg,index)=>{
			const {name,description,valid,validate,coerce,required,key} = _arg
			const defaultValue = _arg.default
			const arg = {index,name,description,valid,validate,coerce,required,key,default:defaultValue};
			methodArgumentsByName[name]	= arg
			methodArgumentsHelp[name] = {name,description,valid,default:defaultValue}
			if(required){
				methodArgumentsSummary.push(name);	
			}else{
				methodOptionalArgumentsSummary.push(name);
			}
			if(required){needsArguments = true;}
			return arg;
		})
	;
	const summary = makeSummary(name,methodArgumentsSummary,methodOptionalArgumentsSummary);
	const jsonHelp = {
		summary
	,	description
	,	args:methodArgumentsHelp
	}
	const yargsOptions = methodToYargs(name,description,methodArguments);
	const checkArgs = makeFunctionArgumentChecker(needsArguments,methodArguments,methodArgumentsByName,append,consume);
	const {length} = methodArguments;

	function mapArray(...args){
		return extend(...args.map(arg=>arg?checkArgs(arg):false).filter(Boolean).reverse());
	}

	const interpret = makeCallbackFunction(apiName)

	function runMethod(props,cb){
		var args;
		try{
			args = checkArgs(props,true);
		}catch(e){
			return interpret(name,args,cb)(e);
		}
		run(args,interpret(name,args,cb));
	};
	runMethod.map = mapArray;
	runMethod.argumentsLength = length;
	return {
		method:runMethod
	,	description:jsonHelp
	,	yargsOptions
	}
}