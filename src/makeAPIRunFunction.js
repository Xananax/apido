export default function makeAPIRunFunction(methods,defaultMethod){
	return function run(methodName,args,cb){
		if(!methodName){methodName=defaultMethod;}
		if(!(methodName in methods)){return cb(new Error(`${methodName} does not exist`));}
		const method = methods[methodName]
		if(typeof args == 'function'){
			cb = args;
			args = {}
		}
		return method(args).then(result=>cb(null,result)).error(cb);
	};
}