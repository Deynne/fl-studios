import { Container, Content } from 'native-base';
import React from 'react';
import { connect } from 'react-redux';

import LoginScreen from './LoginScreenContainer';

const Screen = () => (
  <Container>
    <Content>
      <LoginScreen />
    </Content>
  </Container>
);

const mapStateToProps = state => ({});

const mapActionsToProps = {};

export default connect(mapStateToProps, mapActionsToProps)(Screen);
