import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';
import mod from '.';

test('interface', () => {
  expect(mod instanceof Function).toBe(true);
});

test('functionality', () => {
  const sagaMiddleware = createSagaMiddleware();

  const defaultState = {
    runs: 0,
    counter: 0,
  };

  const reducer = jest.fn((state: typeof defaultState = defaultState, action) => {
    if (action.type === 'inc') {
      return {
        ...state,
        counter: state.counter + 1,
      };
    }
    if (action.type === 'inc-run') {
      return {
        ...state,
        runs: state.runs + 1,
      };
    }
    return state;
  });

  const store = createStore(reducer, applyMiddleware(sagaMiddleware));

  function* channelSaga(counter: number) {
    const { runs: oldRuns } = store.getState();
    expect(counter).toBe(store.getState().counter);
    yield put({ type: 'inc-run' });
    expect(store.getState().runs).toBe(oldRuns + 1);
    expect(counter).toBe(store.getState().counter);
  }

  sagaMiddleware.run(function* testSaga() {
    const chan = yield mod((state: typeof defaultState) => state.counter);
    yield takeEvery(chan, channelSaga);
  });

  expect(store.getState()).toEqual(defaultState);
  store.dispatch({ type: 'inc' });
  expect(store.getState()).toEqual({
    runs: 1,
    counter: 1,
  });
  expect(reducer).toBeCalledTimes(3);
  store.dispatch({ type: 'inc-run' });
  expect(store.getState()).toEqual({
    runs: 2,
    counter: 1,
  });
  expect(reducer).toBeCalledTimes(4);
  store.dispatch({ type: 'inc' });
  expect(store.getState()).toEqual({
    runs: 3,
    counter: 2,
  });
  expect(reducer).toBeCalledTimes(6);
});
