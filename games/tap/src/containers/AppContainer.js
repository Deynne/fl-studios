import { Container, Content } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

import { connect } from 'react-redux';

import Screen from './ScreenContainer';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF6666'
  }
});

const App = props => (
  <Container style={styles.container}>
    <Content>
      <Screen />
    </Content>
  </Container>
);

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(App);
