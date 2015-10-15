export default function checkArg(
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
		throw new Error(`argument for ${name} is invalid`);
	}
	return coerce?coerce(given):given;
}