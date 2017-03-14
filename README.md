#React Redux Issue
I found an issue trying to use TypeScript with a React-Redux
application.

It surfaces when you try to import Provider and
connect from react-redux.

When loading the code in the browser, SystemJS, the
module loader I am using with TypeScript, is convinced
that node_modules/react-redux/dist/react-redux.js is
an ES6 module that needs to be transpiled in the browser.

By default, SystemJS will try to use traceur, but since
I am not loading traceur as part of my app, I get this error
in my browser console:

    Uncaught (in promise) Error: (SystemJS) XHR error (404 Not Found) loading http://localhost:4000/traceur
	    Error: XHR error (404 Not Found) loading http://localhost:4000/traceur
	    Error loading http://localhost:4000/traceur
	    Unable to load transpiler to transpile http://localhost:4000/node_modules/react-redux/dist/react-redux.js
	    Error loading http://localhost:4000/node_modules/react-redux/dist/react-redux.js

You can see the error by cloning this repository and doing this:

    npm install
    npm start

And then go to [http://localhost:4000/index.html](http://localhost:4000/index.html) and look in your JavaScript console to see the error.

OK, SystemJS wants to transpile react-redux, so lets give it a transpiler.

I have babel-standalone handy, but SystemJS doesn't get along with the latest version of Babel.
Fortunately, there's a plugin for it:

    npm install --save systemjs-plugin-babel

I gave this a try in [http://localhost:4000/step1.html](http://localhost:4000/step1.html). It made things worse:

    Uncaught (in promise) Error: (SystemJS) Cannot read property 'PropTypes' of undefined
	    TypeError: Cannot read property 'PropTypes' of undefined
	        at Object.exports.__esModule (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:540:65)
	        at __webpack_require__ (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:30:34)
	        at Object.exports.__esModule (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:605:24)
	        at __webpack_require__ (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:30:34)
	        at Object.exports.__esModule (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:63:23)
	        at __webpack_require__ (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:30:34)
	        at webpackUniversalModuleDefinition (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:8:350)
	        at execute (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:9:6)
	    Error loading http://localhost:4000/node_modules/react-redux/dist/react-redux.js
	        at Object.exports.__esModule (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:540:65)
	        at __webpack_require__ (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:30:34)
	        at Object.exports.__esModule (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:605:24)
	        at __webpack_require__ (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:30:34)
	        at Object.exports.__esModule (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:63:23)
	        at __webpack_require__ (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:30:34)
	        at webpackUniversalModuleDefinition (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:8:350)
	        at execute (http://localhost:4000/node_modules/react-redux/dist/react-redux.js!transpiled:9:6)
	    Error loading http://localhost:4000/node_modules/react-redux/dist/react-redux.js

Transpiling something that has already been transpiled was not the right approach.

The source code to react-redux is there in node_modules. Maybe if we load it instead, it will transpile.

I tried that as [http://localhost:4000/step2.html](http://localhost:4000/step2.html). This was the result:

    GET http://localhost:4000/hoist-non-react-statics 404 (Not Found)
    GET http://localhost:4000/invariant 404 (Not Found)
    Uncaught (in promise) Error: (SystemJS) XHR error (404 Not Found) loading http://localhost:4000/hoist-non-react-statics
	    Error: XHR error (404 Not Found) loading http://localhost:4000/hoist-non-react-statics
	    Error loading http://localhost:4000/hoist-non-react-statics as "hoist-non-react-statics" from http://localhost:4000/node_modules/react-redux/src/components/connectAdvanced.js
    http://localhost:4000/lodash/isPlainObject 404 (Not Found)

A different set of errors. If I look at the package.json for react-redux, I see these dependencies:

    "hoist-non-react-statics": "^1.0.3",
    "invariant": "^2.0.0",
    "lodash": "^4.2.0",
    "lodash-es": "^4.2.0",
    "loose-envify": "^1.1.0"

That matches up with the 404 errors (other than lodash-es and loose-envify). It looks like adding those dependencies
will help it build.

    npm install --save hoist-non-react-statics invariant lodash

And then update the SystemJS config in [http://localhost:4000/step3.html](http://localhost:4000/step3.html). Still getting an error:

    Uncaught (in promise) Error: (SystemJS) process is not defined
	    ReferenceError: process is not defined
	        at Object.eval (http://localhost:4000/node_modules/invariant/invariant.js:23:16)
	        at eval (http://localhost:4000/node_modules/invariant/invariant.js:55:4)
	        at eval (http://localhost:4000/node_modules/invariant/invariant.js:56:3)
	        at eval (<anonymous>)
	    Evaluating http://localhost:4000/node_modules/invariant/invariant.js
	    Error loading http://localhost:4000/node_modules/react-redux/src/index.js
	        at Object.eval (http://localhost:4000/node_modules/invariant/invariant.js:23:16)
	        at eval (http://localhost:4000/node_modules/invariant/invariant.js:55:4)
	        at eval (http://localhost:4000/node_modules/invariant/invariant.js:56:3)
	        at eval (<anonymous>)
	    Evaluating http://localhost:4000/node_modules/invariant/invariant.js
	    Error loading http://localhost:4000/node_modules/react-redux/src/index.js

Apparently `invariant` requires the existence of `process`, which is a global variable found in node.js, not browsers,
so I added it to the next step [http://localhost:4000/step4.html](http://localhost:4000/step4.html).

Now I have a clean console and perhaps TypeScript and react-redux will work together.
