export default function commandRunFunctionFactory(run,commandName,toParams,check,makeJSONResponse){
	return function commandRun(...params){
		const cb = params[params.length-1];
		if(!(typeof cb == 'function')){throw new Error(`no callback function provided to ${commandName}()`);}
		params = params.slice(0,-1);
		try{
			const parameters = toParams(...params);
			const coercedParameters = check(parameters);
			const JSONresponse = makeJSONResponse(parameters,cb);
			return run(coercedParameters,JSONresponse)
		}catch(err){
			return makeJSONResponse(params,cb)(err)
		}
	}
}