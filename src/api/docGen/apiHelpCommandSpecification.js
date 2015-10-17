export default {
	name:'help'
,	command:['get','post']
,	description:'help about the api'
,	optionalParameters:[
		{
			name:'name'
		,	description:'help about'
		,	valid:'string'
		,	validate(parameter){
				return (typeof parameter == 'string')
			}
		}
	]
}