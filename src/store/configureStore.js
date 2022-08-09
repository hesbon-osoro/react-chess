import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { compose, apply, identity } from 'ramda';
import { composeWithDevTools } from 'redux-devtools-extension';
import { IS_DEV, INSTANT_IMPORT_DATA, SAVE_GAME } from '~/presets';
import { Compression } from '~/services/io';
import { Storage } from '~/services/storage';
import { debug } from '~/utils';
import reducers from './reducers';
import { crashReporter } from './middleware';

const composeDev = IS_DEV ? composeWithDevTools : identity;
const _applyMiddleware = apply(applyMiddleware);

function configureStore(preloadedState) {
  let initialState = preloadedState;

  try {
    const importData = Storage.getItem(INSTANT_IMPORT_DATA);
    const saveData = JSON.parse(Storage.getItem(SAVE_GAME));

    initialState = importData
      ? JSON.parse(Compression.decompress(importData))
      : saveData || preloadedState;
  } catch (err) {
    debug.err('Redux - initial-state issue: ', err);
  } finally {
    Storage.removeItem(INSTANT_IMPORT_DATA);
  }

  return createStore(
    reducers,
    initialState,
    compose(composeDev, _applyMiddleware)([thunk, crashReporter])
  );
}

export default configureStore;
