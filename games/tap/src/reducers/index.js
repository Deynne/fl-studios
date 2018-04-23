import { combineReducers } from 'redux';

import app from './appReducer';
import screens from './screensReducer';

export default combineReducers({ app, screens });
