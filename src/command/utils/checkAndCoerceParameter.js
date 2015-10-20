export default function checkAndCoerceParameter(
	given
,	{	
		name
	,	description
	,	valid
	,	validate
	,	coerce
	,	required
	}
,	checkRequired
){
	if((typeof given == 'undefined') || given === null){
		if(required && checkRequired){
			throw new Error(`${name} is required`)
		}
		return given;
	}
	if(validate && !validate(given)){
		throw new Error(`parameter for ${name} is invalid, valid:${valid}, passed:${given}`);
	}
	return coerce?coerce(given):given;
}