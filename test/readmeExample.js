
export default function makeAPIProps(){

	var todos = [
		{text:'b'}
	,	{text:'a'}
	]

	return {
		name:'Todos'
	,	description:'Returns todo items'
	,	default:'getAll'
	,	key:'todos'
	,	commands:[
			{
				name:'add'
			,	description:'adds a todo item'
			,	parameters:[
					{
						name:'text'
					,	description:'the todo text'
					,	valid:'string'
					,	validate(arg){
							return typeof arg == 'string';
						}
					}
				]
			,	run({text},cb){
					var index = todos.push({text}) -1 ;
					cb(null,{index,text});
				}
			}
		,	{
				name:'update'
			,	description:'updates a todo item'
			,	parameters:[
					{
						name:'id'
					,	description:'the todo id'
					,	valid:'number'
					,	validate(arg){
							return (
								(typeof arg == 'number') ||
								(typeof arg == 'string' && arg.match(/\d+/))
							);
						}
					,	coerce(arg){
							return parseInt(arg);
						}
					}
				,	{
						name:'text'
					,	description:'the todo text'
					,	valid:'string'
					,	validate(arg){
							return typeof arg == 'string';
						}
					}
				]
			,	run({text,id},cb){
					var todo = todos[id];
					if(!todo){return cb(new Error('todo was not found'))}
					todo.text = text;
					cb(null,todo);
				}
			}
		,	{
				name:'get'
			,	description:'returns a todo item'
			,	parameters:[
					{
						name:'id'
					,	description:'the todo id'
					,	valid:'number'
					,	validate(arg){
							return (
								(typeof arg == 'number') ||
								(typeof arg == 'string' && arg.match(/\d+/))
							);
						}
					,	coerce(arg){
							return parseInt(arg);
						}
					}
				]
			,	run({id},cb){
					var todo = todos[id];
					if(!todo){return cb(new Error('todo was not found'))}
					cb(null,todo);
				}
			}
		,	{
				name:'getAll'
			,	description:'Returns all todos'
			,	parameters:[]
			,	optionalParameters:[
					{
						name:'orderBy'
					,	alias:'o'
					,	default:'numerical'
					,	description:'ordering of the todo items'
					,	valid:["alphabetical","numerical","a","n"]
					,	validate(arg){
							return (['alphabetical','numerical','a','n'].indexOf(arg)>=0)
						}
					,	coerce(arg){
							if(arg == 'a'){return 'alphabetical'}
							if(arg == 'n'){return 'numerical'}
							return arg;
						}
					}
				]
			,	run({orderBy},cb){
					if(orderBy=='alphabetical'){
						return cb(null,todos.slice().sort((a,b)=>{
							return ((a.text < b.text) ? 
								+ 1 : 
								(a.text > b.text) ?
								1 :
								0
							);
						}))
					}
					return cb(null,todos);
				}
			}
		,	{
				name:'getUsers'
			,	append:true
			,	parameters:[
					{
						name:'id'
					}
				,	{
						name:'path'
					}
				]
			,	run({id,path},cb){
					cb(null,{path});
				}
			}
		,	{
				name:'getUsers2'
			,	append:false
			,	parameters:[
					{
						name:'id'
					}
				,	{
						name:'path'
					}
				]
			,	run({id,path},cb){
					cb(null,{path});
				}
			}
		,	{
				name:'consumeTrue'
			,	consume:true
			,	parameters:[
					{
						name:'id'
					}
				,	{
						name:'path'
					}
				]
			,	run({id,path},cb){
					cb(null,{id,path});
				}
			}
		,	{
				name:'consumeString'
			,	consume:'~'
			,	parameters:[
					{
						name:'id'
					}
				,	{
						name:'path'
					}
				]
			,	run({id,path},cb){
					cb(null,{id,path});
				}
			}
		,	{
				name:'consumeStringAndAppend'
			,	consume:'~'
			,	append:true
			,	parameters:[
					{
						name:'id'
					}
				,	{
						name:'path'
					}
				]
			,	run({id,path},cb){
					cb(null,{id,path});
				}
			}
		]
	}
}