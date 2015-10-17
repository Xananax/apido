import errToJson from '../../utils/errToJson';
const assign = Object.assign;

export default function apiJSONResponseFactory(apiName,commandName){
	return function makeJSONResponse(parameters,cb){
		return function JSONresponse(err,result){
			var response = err ? 'error':'success';
			const answer = {
				response
			,	date:Date.now()
			,	apiName
			,	commandName
			,	parameters:parameters
			,	result:err?null:result
			,	error:err?errToJson(err):null
			,	nativeError:err
			};
			return err? cb(answer) : cb(null,answer);
		}
	}
}