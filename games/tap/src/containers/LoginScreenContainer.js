import {
  Button,
  Container,
  Content,
  Form,
  Icon,
  Input,
  Item,
  Label,
  Text
} from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { updateAppStatus } from '../actions';
import AppLogo from '../components/AppLogo';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  form: {
    alignItems: 'center'
  },
  playButton: {
    backgroundColor: '#CC5151'
  },
  playButtonIcon: {
    fontSize: 18
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  usernameItem: {
    backgroundColor: '#FF8484',
    borderColor: '#FFFFFF',
    marginBottom: 25,
    paddingLeft: 15,
    paddingTop: 7,
    width: '90%'
  },
  usernameItemIcon: {
    color: '#FFFFFF'
  },
  usernameItemInput: {
    color: '#FFFFFF',
    fontSize: 18
  },
  usernameItemLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    paddingLeft: 27,
    paddingTop: 5
  }
});

const LoginScreen = propTypes => (
  <Container style={styles.container}>
    <Content contentContainerStyle={styles.content}>
      <AppLogo />
      <Form style={styles.form}>
        <Item floatingLabel last style={styles.usernameItem}>
          <Label style={styles.usernameItemLabel}>Username</Label>
          <Icon
            name="user"
            type="SimpleLineIcons"
            style={styles.usernameItemIcon}
          />
          <Input style={styles.usernameItemInput} />
        </Item>
        <Button
          full
          iconLeft
          large
          style={styles.playButton}
          onPress={() => propTypes.updateAppStatus('teste')}
        >
          <Icon name="gamepad" type="FontAwesome" />
          <Text style={styles.playButtonText}>Play</Text>
        </Button>
      </Form>
    </Content>
  </Container>
);

const mapStateToProps = state => ({ newStatus: state.app.status });

const mapActionsToProps = { updateAppStatus };

export default connect(mapStateToProps, mapActionsToProps)(LoginScreen);
