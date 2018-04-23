import { UPDATE_APP_STATUS } from '../actions/types';

const INITIAL_STATE = {
  status: 'STARTING'
};

const appReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_APP_STATUS:
      return {
        ...state,
        status: action.payload
      };
    default:
      return state;
  }
};

export default appReducer;
