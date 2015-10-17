export default function parameterFactory(commandParametersByName,commandParametersHelp,commandParametersSummary,commandOptionalParametersSummary){
	return function makeParameter(paramProps,index){
		const {
			name
		,	description
		,	valid
		,	validate
		,	coerce
		,	required
		,	key
		} = paramProps
		const defaultValue = paramProps.default
		const parameter = {
			index
		,	name
		,	description
		,	valid
		,	validate
		,	coerce
		,	required
		,	key
		,	default:defaultValue
		};
		commandParametersByName[name] = parameter
		commandParametersHelp[name] = {name,description,valid,default:defaultValue}
		if(required){
			commandParametersSummary.push(name);	
		}else{
			commandOptionalParametersSummary.push(name);
		}
		return parameter;
	}
}