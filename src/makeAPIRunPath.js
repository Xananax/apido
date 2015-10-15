import pathToCommand from './pathToCommand';

export default function makeAPIRunPath(methods,defaultMethod){
	return function runPath(str,opts,cb){
		if(typeof opts == 'function'){
			cb = opts;
			opts = null;
		}
		const [methodName,path] = pathToCommand(str);
		if(!(methodName in methods)){return next();}
		const method = methods[methodName];
		const args = method.map(path,opts);
		method(args).then(result=>cb(null,result)).error(cb);
	}
}