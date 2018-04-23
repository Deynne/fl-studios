import React from 'react';
import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import App from './src/containers/AppContainer';
import reducers from './src/reducers';

const store = createStore(reducers);

const Navigator = StackNavigator(
  {
    Tap: { screen: App }
  },
  {
    headerMode: 'none',
    initialRouteName: 'Tap',
    navigationOptions: {
      title: 'Tap!'
    }
  }
);

const Tap = () => (
  <Provider store={store}>
    <Navigator />
  </Provider>
);

AppRegistry.registerComponent('tap', () => Tap);

setInterval(() => {
  console.log(store.getState().app);
}, 1000);
