import makeApiProps from './readmeExample';
import apiMaker from '../src';

describe('# apiMaker',()=>
	it('should create an object with the properties `run`, `middleware`, `description`, `methods`',done=>
		apiMaker(makeApiProps())
		.then(api=>{
			api.should.have.property('run')
			api.should.have.property('runPath')
			api.should.have.property('middleware')
			api.should.have.property('description')
			api.should.have.property('methods')
			api.run.should.be.a.function;
			api.middleware.should.be.a.function;
			api.description.should.be.an.object;
			api.methods.should.be.an.object;
			done();
		})
		.error(done)
	)
);

describe('# api.run',()=>{

	describe('# api.run("command",{args})',()=>{
		it('should return an object with the properties `apiName`, `methodName`, `arguments`, `result`',done=>
			apiMaker(makeApiProps())
			.then(api=>api.run('getAll',{orderBy:'a'}))
			.then(answer=>{
				answer.should.have.property('apiName')
				answer.should.have.property('methodName')
				answer.should.have.property('arguments')
				answer.should.have.property('result')
				answer.result[0].text.should.equal('a');
				done()
			})
			.error(done)		
		)
		it('should throw errors on invalid methods',done=>
			apiMaker(makeApiProps())
			.then(api=>api.run('someMethod',{orderBy:'whatevz'}))
			.then(()=>done(new Error('the callback should have been an error')))
			.error(err=>done())		
		)
		it('should throw errors on invalid arguments',done=>
			apiMaker(makeApiProps())
			.then(api=>api.run('getAll',{orderBy:'whatevz'}))
			.then(()=>done(new Error('the callback should have been an error')))
			.error(err=>done())
		)
	});

	describe('# api.run("command")',()=>{
		it('should use default arguments when not provided',done=>
			apiMaker(makeApiProps())
			.then(api=>
				api.run('getAll',{orderBy:'a'})
				.then(answer=>answer.result[0].text.should.equal('a') && api.run('getAll'))
				.then(answer=>answer.result[0].text.should.equal('b') && done())
			)
			.error(done)		
		)
		it('should throw if the argument is required',done=>
			apiMaker(makeApiProps())
			.then(api=>api.run('get'))
			.then(()=>done(new Error('the callback should have been an error')))
			.error(err=>done())
		)
	});

	describe('# api.run("command",[args])',()=>{
		it('should process the arguments in order and pass an object to the final function',done=>
			apiMaker(makeApiProps())
			.then(api=>api.run('get',[0]))
			.then(answer=>{
				answer.arguments.should.have.property('id')
				answer.arguments.id.should.equal(0)
				done()
			})
			.error(err=>done(err))
		)
	})

	describe('# api.run("command",[args,additionalArg])',()=>{
		it('should process the arguments in order and pass an object to the final function',done=>
			apiMaker(makeApiProps())
			.then(api=>api.runPath('getUsers/1/2/3/4'))
			.then(answer=>{
				answer.arguments.should.have.property('id');
				answer.arguments.id.should.equal('1');
				answer.arguments.path.should.be.an.Array();
				answer.result.path.should.be.an.Array();
				answer.result.path.should.eql(['2','3','4'])
				done()
			})
			.error(err=>done(err))
		)
	})
})

describe('# api.middleware(req,res,next)',()=>{
	
	function makeReq(method,path,query,body){return {path,query,method,body}}
	function makeRes(done){
		return {
			json(result){
				if(result.error){done(result);}
				else{done(null,result);}
			}
		}
	}
	function makeReqRes(done,method,path,query,body){return {req:makeReq(method,path,query,body),res:makeRes(done)}}
	
	function e(err,done){console.log(err);done()}

	it('should process the command provided by the first item of req.path',done=>{
		const cb = (err,result)=>{
			if(err){return done(err);}
			result.should.have.property('methodName')
			result.methodName.should.equal('getAll');
			result.result.should.be.an.Array();
			result.result[0].text.should.equal('b');
			done();
		}

		const {req,res} = makeReqRes(cb,'GET','/getAll');

		apiMaker(makeApiProps())
		.then(api=>api.middleware(req,res,done))
		.error(err=>e(err,done))
	})

	it('should process further elements as arguments',done=>{
		const cb = (err,result)=>{
			if(err){return done(err);}
			result.should.have.property('methodName')
			result.methodName.should.equal('get');
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
			result.should.have.property('methodName')
			result.methodName.should.equal('get');
			result.result.should.be.an.Object();
			result.result.text.should.equal('b');
			done();
		}
		
		const {req,res} = makeReqRes(cb,'GET','/get',{id:0});

		apiMaker(makeApiProps())
		.then(api=>api.middleware(req,res,done))
		.error(err=>done(err))
	})

	it('should prefer the path arguments',done=>{
		const cb = (err,result)=>{
			if(err){return done(err);}
			result.should.have.property('methodName')
			result.methodName.should.equal('get');
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
			result.should.have.property('methodName')
			result.methodName.should.equal('get');
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
			result.should.have.property('methodName')
			result.methodName.should.equal('get');
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

describe('#  api.methods.<methodName>(args)',()=>{
	it('should run the method',done=>
		apiMaker(makeApiProps())
		.then(api=>api.methods.getAll({orderBy:'a'}))
		.then(answer=>answer.result[0].text.should.equal('a') && done())
		.error(done)	
	)
});

describe('#  api.runPath(str,args)',()=>{
	it('should run the method',done=>
		apiMaker(makeApiProps())
		.then(api=>api.runPath('/get/0',{id:1}))
		.then(answer=>answer.result.text.should.equal('b') && done())
		.error(done)	
	)
});

describe('# help',()=>{
	describe('# api.run("help")',()=>{
		it('should return a helpful message',done=>{
			apiMaker(makeApiProps())
			.then(api=>api.run('help'))
			.then(answer=>{
				answer.result.should.have.property('name')
				answer.result.should.have.property('description')
				answer.result.should.have.property('methods')
				answer.result.methods.should.be.an.Object()
				answer.result.methods.should.have.property('get');
				answer.result.methods.get.should.have.property('summary')
				answer.result.methods.get.should.have.property('description')
				answer.result.methods.get.should.have.property('args')
				answer.result.methods.get.args.should.be.an.Object()
				answer.result.methods.get.args.should.have.property('id')
				answer.result.methods.get.args.id.should.be.an.Object();
				answer.result.methods.get.args.id.should.have.property('name');
				answer.result.methods.get.args.id.should.have.property('description');
				answer.result.methods.get.args.id.should.have.property('valid');
				done();
			})
			.error(done)	
		})
	})
	describe('# api.run("help",["get"])',()=>{
		it('should return a helpful message',done=>{
			apiMaker(makeApiProps())
			.then(api=>api.run('help',['get']))
			.then(answer=>{
				answer.result.should.have.property('summary')
				answer.result.should.have.property('description')
				answer.result.should.have.property('args');
				answer.result.args.should.have.property('id');
				answer.result.args.id.should.be.an.Object();
				answer.result.args.id.should.have.property('name');
				answer.result.args.id.should.have.property('description');
				answer.result.args.id.should.have.property('valid');
				done();
			})
			.error(done)	
		})
	})
})