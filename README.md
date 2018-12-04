# redux-saga-selector-channel

[![Dependency Status](https://img.shields.io/david/knpwrs/redux-saga-selector-channel.svg)](https://david-dm.org/knpwrs/redux-saga-selector-channel)
[![devDependency Status](https://img.shields.io/david/dev/knpwrs/redux-saga-selector-channel.svg)](https://david-dm.org/knpwrs/redux-saga-selector-channel#info=devDependencies)
[![Greenkeeper badge](https://badges.greenkeeper.io/knpwrs/redux-saga-selector-channel.svg)](https://greenkeeper.io/)
[![Build Status](https://img.shields.io/travis/knpwrs/redux-saga-selector-channel.svg)](https://travis-ci.org/knpwrs/redux-saga-selector-channel)
[![Npm Version](https://img.shields.io/npm/v/redux-saga-selector-channel.svg)](https://www.npmjs.com/package/redux-saga-selector-channel)
[![TypeScript 3](https://img.shields.io/badge/TypeScript-3-blue.svg)](http://shields.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Badges](https://img.shields.io/badge/badges-8-orange.svg)](http://shields.io/)

Create a [redux-saga] [channel] which updates with changes to a selector
function.

## Example Usage

```js
import { buffers } from 'redux-saga';
import { takeEvery } from 'redux-saga/effects';
import selectorChannel from 'redux-saga-selector-channel';

// ...

function* selectorSaga(selectorOutput) {
  // Use `selectorOutput` here, yield effects, do whatever you do in a saga!
}

// ...

function* mainSaga() {
  const chan = yield selectorChannel(selector, buffers.expanding(10));
  yield takeEvery(chan, selectorSaga);
}

// ...
```

## API

### `selectorChannel` (default export)

This package exports a single function which takes one or two arguments. The
first argument is a selector function which will be passed the state of the
redux store. The second argument is an optional buffer.

This function returns a `call` effect which must be `yield`ed to the
[redux-saga] runtime. The result will be a [channel] you can use in the same
way as any other [redux-saga] [channel] (`take`, `takeEvery`, `takeLatest`,
etc). The contents of the channel will consist of each new output from the
selector function (determined with `===`).

## WARNING

Do not yield any effects from any saga which is handling output from your
selector which will cause the selector to create a new output! This will cause
an infinite loop. For a concrete example, consider the following:

```js
// DO NOT DO THIS!

function* selectorSaga(counter) {
  yield put(incrementCounter());
}

function* mainSaga() {
  const chan = yield selectorChannel(state => state.counter);
  yield takeEvery(chan, selectorSaga);
}
```

The selector function in this case returns the current `counter` value and the
saga running in response to the selector output changing itself `put`s an event
which changes the `counter` value. This causes an infinite loop! It is okay to
`put` from a selector response saga, but you have to be careful not to cause
infinite loops.

## A Note on Build Systems

This package uses non-transpiled generator functions in order to give you the
flexibility to either use native generator functions or transpile them
yourself. If you need to support browsers that do not natively support
generator functions, make sure you configure your build to transpile this
package! In a setup using [webpack] the easiest way to do this is to use
[`Rule.include`] and explitily include your source directories as well as the
resolved path to this module (rather than using [`Rule.exclude`] to exclude
`node_modules` and then somehow excluding this package from [`Rule.exclude`]).

This package also doesn't have a `main` field, only a `module` field. As long
as you are using a modern build system this should not be a problem.

## Prior Art

This package is simply a TypeScript packaging of
[`redux-saga/redux-saga#1694`][issue]. There may be future changes to support
passing additional arguments to the selector function (as is already supported
in the `select` effect). Pull requests welcome!

## License

**MIT**

[`Rule.exclude`]: https://webpack.js.org/configuration/module/#rule-exclude
[`Rule.include`]: https://webpack.js.org/configuration/module/#rule-include
[channel]: https://redux-saga.js.org/docs/advanced/Channels.html "Redux-Saga: Using Channels"
[issue]: https://github.com/redux-saga/redux-saga/issues/1694
[redux-saga]: https://redux-saga.js.org/ "An alternative side effect model for Redux apps"
[repo]: https://github.com/redux-saga/redux-saga/
[webpack]: https://webpack.js.org/
