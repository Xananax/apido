# apido

A library to create environment-agnostic, full-on json, self-documenting apis. These apis can then be consumed any way you want, http, sockets, command line, or as a library.

It doesn't create exactly REST-like Apis, because those would be incompatible with other consumption commands.

---

# TL;DR:

You want to define functions once, and be able to use them everywhere, with parameters checking and casting, and self-generating documentation? You've come to the right place.

---

# Install & Usage

```sh
npm install --save apido
```

example:

```js
import apido from 'apido';

var todos = [
    {text:'b'}
,   {text:'a'}
]

apido({
    name:'Todos'
,   description:'Returns todo items'
,   default:'getAll'
,   key:'todos'
,   commands:[
        {
            name:'add'
        ,   description:'adds a todo item'
        ,   parameters:[
                {
                    name:'text'
                ,   description:'the todo text'
                ,   valid:'string'
                ,   validate(arg){
                        return typeof arg == 'string';
                    }
                }
            ]
        ,   run({text},cb){
                var index = todos.push({text}) -1 ;
                cb(null,{index,text});
            }
        }
    ,   {
            name:'update'
        ,   description:'updates a todo item'
        ,   parameters:[
                {
                    name:'id'
                ,   description:'the todo id'
                ,   valid:'number'
                ,   validate(arg){
                        return (
                            (typeof arg == 'number') ||
                            (typeof arg == 'string' && arg.match(/\d+/))
                        );
                    }
                ,   coerce(arg){
                        return parseInt(arg);
                    }
                }
            ,   {
                    name:'text'
                ,   description:'the todo text'
                ,   valid:'string'
                ,   validate(arg){
                        return typeof arg == 'string';
                    }
                }
            ]
        ,   run({text,id},cb){
                var todo = todos[id];
                if(!todo){return cb(new Error('todo was not found'))}
                todo.text = text;
                cb(null,todo);
            }
        }
    ,   {
            name:'get'
        ,   description:'returns a todo item'
        ,   parameters:[
                {
                    name:'id'
                ,   description:'the todo id'
                ,   valid:'number'
                ,   validate(arg){
                        return (
                            (typeof arg == 'number') ||
                            (typeof arg == 'string' && arg.match(/\d+/))
                        );
                    }
                ,   coerce(arg){
                        return parseInt(arg);
                    }
                }
            ]
        ,   run({id},cb){
                var todo = todos[id];
                if(!todo){return cb(new Error('todo was not found'))}
                cb(null,todo);
            }
        }
    ,   {
            name:'getAll'
        ,   description:'Returns all todos'
        ,   parameters:[]
        ,   optionalParameters:[
                {
                    name:'orderBy'
                ,   alias:'o'
                ,   default:'numerical'
                ,   description:'ordering of the todo items'
                ,   valid:["alphabetical","numerical","a","n"]
                ,   validate(arg){
                        return (['alphabetical','numerical','a','n'].indexOf(arg)>=0)
                    }
                ,   coerce(arg){
                        if(arg == 'a'){return 'alphabetical'}
                        if(arg == 'n'){return 'numerical'}
                        return arg;
                    }
                }
            ]
        ,   run({orderBy},cb){
                if(orderBy=='alphabetical'){
                    return cb(null,todos.slice().sort((a,b)=>{
                        return ((a.text < b.text) ? 
                            - 1 : 
                            (a.text > b.text) ?
                            1 :
                            0
                        );
                    }))
                }
                return cb(null,todos);
            }
        }
    ,   {
            name:'getUsers'
        ,   parameters:[
                {
                    name:'id'
                }
            ,   {
                    name:'path'
                }
            ]
        ,   run({id,path},cb){
                cb(null,{path});
            }
        }
    ]
})
.then(api=>{
    //api is ready
})
.error(err=>{throw err})

```

the `api` object will have five properties:

- `api.run(command,parameters)`
- `api.runPath(path,opts)`
- `api.middleware(req,res,next)`
- `api.commands`

You can call the commands in the example above as such:

```js
api.run('get',{id:0})
    .then(res=>console.log(res))
    .error(err=>throw err)
```

or:
```js
var req = {path:'/get/0',query:{}};
var res = {
    json(val){
        console.log(val)
    }
}
api.middleware(req,res)
```

or:
```js
api.commands.get({id:0})
    .then(res=>console.log(res))
    .error(err=>throw err)
```

or:
```js
api.runPath('get/0') //or api.runPath('get',{id:0})
    .then(res=>console.log(res))
    .error(err=>throw err)
```

or with [primus](https://github.com/primus/primus):
```js
primus.on('connection',spark=>{
    spark.on('data',api.primus(spark));
})
```

Additionally, all commands can be explored by calling `help`, like so:

```js
api.run('help').then()
api.commands.help().then()
api.middleware({path:'/help'},res)
api.runPath('/help')
//or, for a specific command:
api.run('help',{name:'getAll'}).then()
api.commands.help('getAll').then()
api.middleware({path:'/help/getAll'},res)
```

---

# apido Methods

## apido({}) → Promise

Creates an api. See below.

## apido.fromObject({}) → Promise

Useful to quickly prototype an api without fumbling with options too long.

If you have an object of methods that follow the following specs:

- All methods are async.
- All methods take a regular nodeback (`function(err,result)`) as their last argument.
- All methods have a defined number of arguments, *or* have a `size` property set. The `size` property, if set, should not include the callback in their number (that is, if the function uses 3 arguments and a callback, `size` should equal 3).

```js
import {fromObject} from 'apido';

var commands = {
    a(someArgument,cb){
        cb()
    }
,   b(arg1,arg2,cb){
        cb()
    }
,   c(...args){
        var cb = args[0];
        cb();
    } 
,   d(...args){
        var cb = args[3];
        cb()
    }
}
commands.d.size = 3;

fromObject(commands)
    .then(api=>{
        // api is ready
    })
    .error(err=>{throw err})
```

in the example above, command 'c' will receive no arguments (apart from a callback), because `fromObject` has no way to determine how many arguments it uses. The function 'd' will receive 3 arguments, and the callback (so 4 arguments in total), because it's `size` property is set.


---

# API Methods & Properties

## api.runCommand(command,parameters) → Promise

- `command` is a string
- `parameters` is an object or an array
Runs the specified command if found, or rejects the promise

## api.runPath(path,parameters) → Promise
- `path` is a `/` separated string
- `parameters` is an object or an array
`path` will be split on the `/` character. The first element will me the command, all other elements will be parameters, in order.

- If given parameters are more numerous than the command's parameters, the command has the `append` property set, then the last element will inherit the rest of the array; elsewise, the additional parameters are discarded.
- If `consume` is set, the array will be split on the `consume` character. (`/path/to:/something/else` with `consume` set to `:` will yield: `[['path','to'],['something','else']]`)

## api.middleware(req,res,next) → undefined
a connect-compatible middleware. If you are not using it with express, be sure to parse `req.query` before passing `req`. If you intend to use http methods other than `get`, be sure to parse `body`;

## api.primus(spark) → undefined
Handler for a [primus](https://github.com/primus/primus) socket. Use it like so:
```js
primus.on('connection',spark=>{
    spark.on('data',api.primus(spark));
})
```

Or, for more customization:
```js
primus.on('connection',spark=>{
    const onData = api.primus(spark);
    spark.on('data',data=>{
        // do something with data
        onData(data);
    });
})
```

It is expected that `data`  is an object that contains at least a `command` property, as well as all needed parameters to run the command.

## api.addCommand({commandObject}) → undefined
Adds a command to the api. The command should a valid command object (see below).

## api.nest(api) → undefined
Nests an api under another api

## api.commands → Object
An object containing all the commands. All commands return promises.

---

# Objects:

## Argument

A minimal parameter needs at least a property `name`:

```js
var arg = {name:'id'}
```

Here's the complete list of properties:
```js
var arg = {
    name:'orderBy' //used when passing an object of parameters
,   alias:'o' //used in command-line (not implemented yet)
,   description:'ordering of the todo items' //displays in help
,   valid:["alphabetical","numerical","a","n"] //displays in help, NOT used by any validation function
,   validate(arg){ //should return a boolean
        return (['alphabetical','numerical','a','n'].indexOf(arg)>=0)
    }
,   coerce(arg){ //called only if validation passed
        if(arg == 'a'){return 'alphabetical'}
        if(arg == 'n'){return 'numerical'}
        return arg;
    }
}
```

Optional parameters take an additional property, `default`:
```js
// if `something` is not user specified, then "a value" will be returned
var arg = {
    name:'something'
,   default:'a value'
}
```


## Method

A minimal command needs the following:

```js
var command = {
    name:'addTodo' //name of the command
,   run(props,cb){
        cb(null,'anything')
    }
}
```

Here's the full listing of properties:

```js
var command = {
    name:'addTodo' //name of the command
,   description:'Returns all todos' //used in help
,   append:false //if true, additional parameters will be appended to the last parameter (see below)
,   parameters:[] //array of parameters objects
,   optionalParameters:[] //array of parameters objects
,   run(props,cb){
        cb(null,'anything')
    }
}
```

When calling a command, one might pass either an object or an array as parameters.
In other words, for the following command:
```js
var command = {
    name:'aMethod'
,   parameters:[
        {name:'first'}
    ,   {name:'second'}
    ]
,   run({first,second},cb){
        cb(null,true)
    }
}
```

All these calls are equivalent:
```js
api.run('aMethod',{first:'a',second:'b'})
api.run('aMethod',['a','b'])
api.runPath('/aMethod/a/b')
api.runPath('/aMethod',['a','b'])
api.runPath('/aMethod/a',{second:'b'})
api.runPath('/aMethod/a',[,'b'])
api.commands.aMethod(['a','b'])
api.commands.aMethod({first:'a',second:'b'})
```

**Note on the `append` property**: If true, arrays will be split on the parameters length, and the last parameter will receive the remaining elements. In other words, for this call:
```js
api.run('aMethod',['a','b','c'])
```

the `run` function will be called with:
```js
function run({first,second},cb){
    console.log(first) //'a'
    console.log(second) //['b','c']
}
```

This is useful for having paths of arbitrary length, or for nesting apis:

```js
//getUsers/0/some/path/
var command = {
    name:'getUsers'
,   append:true
,   parameters:[
        {
            name:'id'
        }
    ,   {
            name:'path'
        }
    ]
,   run({id,path},cb){
        api2.runPath(path) // /some/path
            .then(result=>cb(null,result.answer))
            .error(cb)
    }
}
```

this is exactly what `api.nest` does under the hood.

**Note on the `consume` property**: can be either `true` (the first parameter will be the full array), or a string (the array will be split on that string).

```js
//changeUserDirectory/some/path/:/some/other/path
var command = {
    name:'changeUserDirectory'
,   append:true
,   consume:':'
,   parameters:[
        {
            name:'source'
        }
    ,   {
            name:'destination'
        }
    ]
,   run({source,destination},cb){
        console.log(source,destination) 
        //['some','path'],['some','other','path']
        cb();
    }
}
```

# API

A minimal API needs the following:

```js
var API = {
    name:'Todos' //used in help
,   commands:[] //an array of commands objects
}
```

Full listing of properties:
```js
var API = {
    name:'Todos'
,   description:'Returns todo items'
,   default:'getAll' //when no command is provided, this will be the default command. Defaults to 'help'
,   commands:[]
}
```

After going through the factory, an API will have an additional command, `help`, that will display information about the api or any command.

---

# Compiling and testing

```sh
npm install --dev
```

tests:

```sh
npm test
```

compile:

```sh
npm run compile
```


Tests are a bit shit at the moment, but do make an ok job of testing the main functionality. The code is a bit of a mess and I'd need to refactor before being able to run more useful tests.

---

# MIT License

Copyright © Jad Sarout

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.