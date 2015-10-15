export default {
	name:'help'
,	method:['get','post']
,	description:'help about the api'
,	optionalArgs:[
		{
			name:'name'
		,	description:'help about'
		,	valid:'string'
		,	validate(arg){
				return (typeof arg == 'string')
			}
		}
	]
}