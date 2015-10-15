const validYargTypes = /array|boolean|count|string/

export default function methodToYargs(name,description,args){
	const yargOptions = {};
	args.forEach(arg=>{
		const {name,description,valid,validate,coerce,required} = arg;
		const key = arg.key || name
		yargOptions[key] = {
			alias:name
		,	required
		,	default:arg.default
		,	description
		,	type:(typeof valid == 'string' && validYargTypes.test(valid))? valid : false
		}
	});
	return {
		name
	,	usage:description
	,	options:yargOptions
	}
}