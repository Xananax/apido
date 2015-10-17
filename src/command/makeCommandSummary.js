export default function makeCommandSummary(name,commandParametersSummary,commandOptionalParametersSummary){
	var str = name+'(';
	if(commandParametersSummary.length || commandOptionalParametersSummary.length){
		if(commandOptionalParametersSummary.length){
			commandParametersSummary.push('['+commandOptionalParametersSummary.join(',')+']');
		}
		if(commandParametersSummary.length){
			str+=commandParametersSummary.join(',');
		}
	}
	str+=')';
	return str;
}