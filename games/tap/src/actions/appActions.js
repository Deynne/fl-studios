import { UPDATE_APP_STATUS } from './types';

export const updateAppStatus = payload => ({
  type: UPDATE_APP_STATUS,
  payload
});
