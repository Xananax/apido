import errToJson from './errToJson';
const assign = Object.assign;

function createCallback(apiName,methodName,args,result,err){
	return function(methodName,args,result,err){
		var response = err ? 'error':'success';
		return{
			response
		,	date:Date.now()
		,	apiName
		,	methodName
		,	arguments:args
		,	result:err?null:result
		,	error:err?errToJson(err):null
		};
	}
}

export default function makeCallbackFunction(apiName){
	const interpret = createCallback(apiName)
	return function callback(methodName,args,cb){
		if(typeof args == 'function'){
			cb = args;
			args={};
		}
		return function (err,result){
			if(err){
				return cb(interpret(methodName,args,null,err));
			}
			return cb(null,interpret(methodName,args,result,null));
		}
	}
}