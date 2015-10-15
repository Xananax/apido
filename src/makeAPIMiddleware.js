import requestToCommand from './requestToCommand';
import isRequestVerbValid from './isRequestVerbValid';


export default function makeAPIMiddleware(methods,defaultMethod){
	return function apiMiddleware(req,res,next){
		const [methodName,path,requestVerb] = requestToCommand(req);
		if(!(methodName in methods)){return next();}
		const method = methods[methodName];
		if(!isRequestVerbValid(requestVerb,method.method)){
			return next();
		}
		const args = requestVerb == 'get' ? 
			method.map(path,req.query,req.body) : 
			method.map(path,req.body,req.query)
		;
		method(args).then(result=>res.json(result)).error(err=>res.json(err));
	}
}