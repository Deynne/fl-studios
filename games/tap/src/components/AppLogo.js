import { Text } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  logo: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

const AppLogo = () => <Text style={styles.logo}>Tap!</Text>;

export default AppLogo;
