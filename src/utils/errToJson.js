export default function errorToJson(err){
	return {
		name:err.name
	,	status:err.status || 500
	,	code:err.code || 0
	,	message:err.message
	,	stack:err.stack.split('\n')
	};
}