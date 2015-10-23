export default function makeAPIMiddleware(runCommand,pathToCommand,useJson){
	return function apiMiddleware(req,res,next){

		const requestVerb = req.method && req.method.toLowerCase() || 'get';

		function cb(err,answer){
			if(err){return useJson ? res.json(err) : next(err.nativeError);}
			if(answer){return res.json(answer);}
			return next();
		}

		const [command,parameters] = pathToCommand(decodeURI(req.path));
		
		return requestVerb == 'get' ? 
			runCommand(command,parameters,req.query,req.body,cb) : 
			runCommand(command,parameters,req.body,req.query,cb)
		;
	}
}