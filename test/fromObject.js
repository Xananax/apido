import {fromObject} from '../src';

function makeObject(){
	var object = {
		someMethod(someArgument,cb){
			cb(null,someArgument)
		}
	,	someOtherMethod(arg1,arg2,cb){
			cb(null,Array.prototype.slice.call(arguments,0,-1));
		}
	,	someThirdMethod(...args){
			const cb = args[args.length-1];
			cb(null,args.slice(0,-1));
		}
	,	someFourthMethod(...args){
			const cb = args[args.length-1];
			cb(null,args.slice(0,-1));
		}
	}
	object.someFourthMethod.size = 3;
	return object;
}

describe('# apiMaker.fromObject({})',()=>{

	it('should create an object with the properties `runCommand`, `middleware`, `description`, `commands`',done=>
		fromObject(makeObject())
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
		.error(err=>done(err.nativeError))
	)

	it('should translate arguments according to the `length` property',done=>
		fromObject(makeObject())
		.then(api=>
			api.runCommand('someMethod',['ba3'])
			.then(answer=>{
				answer.result.should.equal('ba3')
			})
			.then(()=>api.runCommand('someOtherMethod',['a','b','c']))
			.then(answer=>{
				answer.result.should.be.an.Array();
				answer.result.length.should.equal(2);
				answer.result.should.eql(['a','b']);
			})
			.then(()=>api.runCommand('someThirdMethod',['a','b','c']))
			.then(answer=>{
				answer.result.should.be.an.Array();
				answer.result.length.should.equal(0);
				done()
			})
		)
		.error(err=>done(err.nativeError))
	)

	it('should translate arguments according to the `size` property if it is set',done=>
		fromObject(makeObject())
		.then(api=>api.runCommand('someFourthMethod',['a','b']))
		.then(answer=>{
			answer.result.should.be.an.Array();
			answer.result.length.should.equal(3);
			answer.result[0].should.equal('a');
			done()
		})
		.error(err=>done(err.nativeError))
	)
});