import {
  Buffer,
  channel,
} from 'redux-saga';
import {
  CallEffect,
  call,
  put,
  select,
  spawn,
  take,
} from 'redux-saga/effects';

export type StateSelector<T, U> = (state: T) => U;

export default <T, U>(
  selector: StateSelector<T, U>,
  buffer?: Buffer<U>,
): CallEffect => call(function* createSelectorChannel() {
  const chan = channel<U>(buffer);
  let previous: U;

  yield spawn(function* runSelectorChannel() {
    try {
      while (true) {
        yield take('*');
        const result = yield select(selector);
        if (result !== previous) {
          yield put(chan, result);
          previous = result;
        }
      }
    } finally {
      chan.close();
    }
  });

  return chan;
});
