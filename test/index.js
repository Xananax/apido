import makeApiProps from './readmeExample';
import apiMaker from '../src';

describe('# apiMaker',()=>{
	it('should create an object with the properties `runCommand`, `middleware`, `description`, `commands`',done=>
		apiMaker(makeApiProps())
		.then(api=>{
			api.should.have.property('runCommand')
			api.should.have.property('runPath')
			api.should.have.property('middleware')
			api.should.have.property('description')
			api.should.have.property('commands')
			api.runCommand.should.be.a.function;
			api.middleware.should.be.a.function;
			api.description.should.be.an.object;
			api.commands.should.be.an.object;
			done();
		})
		.error(done)
	)
	describe('# api.addCommand',()=>{
		it('should add a command',done=>{
			apiMaker(makeApiProps())
			.then(api=>{
				api.addCommand({
					name:'example'
				,	description:'an example command'
				,	parameters:[
						{
							name:'param'
						,	description:'a parameter'
						}
					]
				,	run(){

					}
				});
				api.commands.should.have.property('example');
				return api.runCommand('help',['example'])
			})
			.then(answer=>{
				answer.result.name.should.equal('example');
				done();
			})
		})
	})
});

describe('# api.runCommand',()=>{

	describe('# api.runCommand("command",{parameters})',()=>{
		it('should return an object with the properties `apiName`, `commandName`, `parameters`, `result`',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runCommand('getAll',{orderBy:'a'}))
			.then(answer=>{
				answer.should.have.property('apiName')
				answer.should.have.property('commandName')
				answer.should.have.property('parameters')
				answer.should.have.property('result')
				answer.result[0].text.should.equal('a');
				done()
			})
			.error(err=>done(err.nativeError))
		)
		it('should throw errors on invalid commands',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runCommand('someMethod',{orderBy:'whatevz'}))
			.then(()=>done(new Error('the callback should have been an error')))
			.error(err=>done())		
		)
		it('should throw errors on invalid parameters',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runCommand('getAll',{orderBy:'whatevz'}))
			.then(()=>done(new Error('the callback should have been an error')))
			.error(err=>done())
		)
	});

	describe('# api.runCommand("command")',()=>{
		it('should use default parameters when not provided',done=>
			apiMaker(makeApiProps())
			.then(api=>
				api.runCommand('getAll',{orderBy:'a'})
				.then(answer=>answer.result[0].text.should.equal('a') && api.runCommand('getAll'))
				.then(answer=>answer.result[0].text.should.equal('b') && done())
			)
			.error(done)		
		)
		it('should throw if the argument is required',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runCommand('get'))
			.then(()=>done(new Error('the callback should have been an error')))
			.error(err=>done())
		)
	});

	describe('# api.runCommand("command",[parameters])',()=>{
		it('should process the parameters in order and pass an object to the final function',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runCommand('get',[0]))
			.then(answer=>{
				answer.parameters.should.have.property('id')
				answer.parameters.id.should.equal(0)
				done()
			})
			.error(err=>done(err))
		)
	})


	describe('# api.runCommand("command",[parameters,additionalArg]) with append set to true',()=>{
		it('should process the parameters in order and pass an object to the final function',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runCommand('getUsers',['1','2','3','4']))
			.then(answer=>{
				answer.parameters.should.have.property('id');
				answer.parameters.id.should.equal('1');
				answer.parameters.path.should.be.an.Array();
				answer.result.path.should.be.an.Array();
				answer.result.path.should.eql(['2','3','4'])
				done()
			})
			.error(err=>done(err))
		)
	})

	describe('# api.runCommand("command",[parameters,additionalArg]) with append set to false',()=>{
		it('should process the parameters in order and pass an object to the final function',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runPath('getUsers2/1:2:3:4'))
			.then(answer=>{
				answer.parameters.should.have.property('id');
				answer.parameters.id.should.equal('1');
				answer.result.path.should.equal('2')
				done()
			})
			.error(err=>done(err))
		)
	})

	describe('# command with `consume` set to true',()=>{
		it('should use the full array in the first argument',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runPath('consumeTrue/1:2:3:4',{path:'a'}))
			.then(answer=>{
				answer.result.id.should.eql(['1','2','3','4'])
				answer.result.path.should.equal('a');
				done()
			})
			.error(err=>done(err))
		)
	})

	describe('# command with `consume` set to a string',()=>{
		it('should split the array on the character provided',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runPath('consumeString/1:2:3:4~5:6:7:8~9:10:11'))
			.then(answer=>{
				answer.result.id.should.eql(['1','2','3','4'])
				answer.result.path.should.eql(['5','6','7','8'])
				done()
			})
			.error(err=>done(err))
		)
	})

	describe('# command with `consume` set to a string and `append` set to true',()=>{
		it('should use the full array',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runPath('consumeStringAndAppend/1:2:3:4~5:6:7:8~9~:10:11'))
			.then(answer=>{
				answer.result.id.should.eql(['1','2','3','4'])
				answer.result.path.should.eql([ [ '5', '6', '7', '8' ], [ '9' ], [ '10', '11' ] ])
				done()
			})
			.error(err=>done(err))
		)
	})
})

describe('# api.middleware(req,res,next)',()=>{
	
	function makeReq(method,path,query,body){
		return {
			path
		,	query
		,	method
		,	body
		};
	}

	function makeRes(done){
		return {
			json(result){
				if(result.error){done(result);}
				else{done(null,result);}
			}
		}
	}

	function makeReqRes(done,method,path,query,body){
		return {
			req:makeReq(method,path,query,body)
		,	res:makeRes(done)
		};
	}
	
	function e(err,done){console.log(err);done()}

	it('should process the command provided by the first item of req.path',done=>{
		const cb = (err,result)=>{
			if(err){return done(err);}
			result.should.have.property('commandName')
			result.commandName.should.equal('getAll');
			result.result.should.be.an.Array();
			result.result[0].text.should.equal('b');
			done();
		}

		const {req,res} = makeReqRes(cb,'GET','/getAll');

		apiMaker(makeApiProps())
		.then(api=>api.middleware(req,res,done))
		.error(err=>e(err,done))
	})

	it('should process further elements as parameters',done=>{
		const cb = (err,result)=>{
			if(err){return done(err);}
			result.should.have.property('commandName')
			result.commandName.should.equal('get');
			result.result.should.be.an.Object();
			result.result.text.should.equal('b');
			done();
		}
		
		const {req,res} = makeReqRes(cb,'GET','/get/0');

		apiMaker(makeApiProps())
		.then(api=>api.middleware(req,res,done))
		.error(err=>done(err))
	})

	it('should use the query object',done=>{
		const cb = (err,result)=>{
			if(err){return done(err);}
			result.should.have.property('commandName')
			result.commandName.should.equal('get');
			result.result.should.be.an.Object();
			result.result.text.should.equal('b');
			done();
		}
		
		const {req,res} = makeReqRes(cb,'GET','/get',{id:0});

		apiMaker(makeApiProps())
		.then(api=>api.middleware(req,res,done))
		.error(err=>done(err))
	})

	it('should prefer the path parameters',done=>{
		const cb = (err,result)=>{
			if(err){return done(err);}
			result.should.have.property('commandName')
			result.commandName.should.equal('get');
			result.result.should.be.an.Object();
			result.result.text.should.equal('a');
			done();
		}
		
		const {req,res} = makeReqRes(cb,'GET','/get/1',{id:0});

		apiMaker(makeApiProps())
		.then(api=>api.middleware(req,res,done))
		.error(err=>done(err))
	})

	it('should prefer req.query to req.body for GET requests',done=>{
		const cb = (err,result)=>{
			if(err){return done(err);}
			result.should.have.property('commandName')
			result.commandName.should.equal('get');
			result.result.should.be.an.Object()
			result.result.text.should.equal('b');
			done();
		}
		
		const {req,res} = makeReqRes(cb,'GET','/get',{id:0},{id:1});
		apiMaker(makeApiProps())
		.then(api=>api.middleware(req,res,done))
		.error(err=>done(err))
	})

	it('should prefer req.body to req.query for other http verbs',done=>{
		const cb = (err,result)=>{
			if(err){return done(err);}
			result.should.have.property('commandName')
			result.commandName.should.equal('get');
			result.result.should.be.an.Object()
			result.result.text.should.equal('a');
			done();
		}
		
		const {req,res} = makeReqRes(cb,'POST','/get',{id:0},{id:1});

		apiMaker(makeApiProps())
		.then(api=>api.middleware(req,res,done))
		.error(err=>done(err))
	})

})

describe('#  api.commands.<commandName>(parameters)',()=>{
	it('should runCommand the command',done=>
		apiMaker(makeApiProps())
		.then(api=>api.commands.getAll({orderBy:'a'}))
		.then(answer=>answer.result[0].text.should.equal('a') && done())
		.error(done)	
	)
});

describe('#  api.runPath(str,parameters)',()=>{
	it('should runCommand the command',done=>
		apiMaker(makeApiProps())
		.then(api=>api.runPath('/get/0',{id:1}))
		.then(answer=>answer.result.text.should.equal('b') && done())
		.error(done)	
	)
});

describe('# help',()=>{
	describe('# api.runCommand("help")',()=>{
		it('should return a helpful message',done=>{
			apiMaker(makeApiProps())
			.then(api=>api.runCommand('help'))
			.then(answer=>{
				answer.result.should.have.property('name')
				answer.result.should.have.property('description')
				answer.result.should.have.property('commands')
				answer.result.commands.should.be.an.Object()
				answer.result.commands.should.have.property('get');
				answer.result.commands.get.should.have.property('summary')
				answer.result.commands.get.should.have.property('description')
				answer.result.commands.get.should.have.property('parameters')
				answer.result.commands.get.parameters.should.be.an.Object()
				answer.result.commands.get.parameters.should.have.property('id')
				answer.result.commands.get.parameters.id.should.be.an.Object();
				answer.result.commands.get.parameters.id.should.have.property('name');
				answer.result.commands.get.parameters.id.should.have.property('description');
				answer.result.commands.get.parameters.id.should.have.property('valid');
				done();
			})
			.error(done)	
		})
	})
	describe('# api.runCommand("help",["get"])',()=>{
		it('should return a helpful message',done=>{
			apiMaker(makeApiProps())
			.then(api=>api.runCommand('help',['get']))
			.then(answer=>{
				answer.result.should.have.property('summary')
				answer.result.should.have.property('description')
				answer.result.should.have.property('parameters');
				answer.result.parameters.should.have.property('id');
				answer.result.parameters.id.should.be.an.Object();
				answer.result.parameters.id.should.have.property('name');
				answer.result.parameters.id.should.have.property('description');
				answer.result.parameters.id.should.have.property('valid');
				done();
			})
			.error(err=>done(err.nativeError))	
		})
	})
})