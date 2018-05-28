import { DangerZone, Font, ImagePicker } from 'expo';
import { Button, Input, Item } from 'native-base';
import React from 'react';
import { Alert, AsyncStorage, BackHandler, Image, StatusBar, StyleSheet, Text, TouchableHighlight, View } from 'react-native';

import rocketAnimation from './assets/lotties/bms-rocket.json';

const { Lottie } = DangerZone;

const appName = 'TRE Einstein';
const appIcon = './assets/images/app-icon.png';
const questions = [{
  answer: 'A teoria da relatividade de Einstein.',
  number: 1,
  options: [
    'A teoria da natureza da luz.',
    'A teoria das cordas.',
    'A teoria atômica de Bohr.',
    'A teoria da relatividade de Galileu.',
    'A teoria da relatividade de Einstein.',
  ],
  question: 'A palavra relatividade não foi criada por Einstein, muito embora seja comum ligá-lo ao termo como se fosse o criador da relatividade. Galileu cerca de 300 anos antes, já usava com maestria a relatividade nas interpretações de problemas cinemáticos. Toda via, o significado da palavra relatividade sofreu várias modelagens no meio acadêmico, principalmente quando se constatou a velocidade da luz como uma quantidade absoluta. A teoria que evidencia esse fato e que a partir da qual a concepção cotidiana de tempo e espaço sofrem alterações radicais é:',
}, {
  answer: 'Segundo Fermat, a luz tem velocidade maior no ar que na água.',
  number: 2,
  options: [
    'Segundo Galileu, a velocidade da luz era 1000 vezes maior que a do som, por isso, se enxergava o relâmpago e só depois se ouve o trovão durante uma tempestade.',
    'Segundo Newton, a velocidade da luz é instantânea e infinita.',
    'Segundo Newton, a luz, ao penetrar na água, tem sua velocidade reduzida pois a água é um meio resistivo.',
    'Segundo Fermat, a luz tem velocidade maior no ar que na água.',
    'Einstein aceitou o modelo ondulatório da luz como sendo o modelo mais adequado, e esse é o que prevalece até hoje.',
  ],
  question: 'A respeito da velocidade e natureza da luz. Marque a alternativa correta:',
}];
const splashTimer = 0;
const userPictureDefault = './assets/images/userPicture-default.png';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      actualQuestion: 0,
      animationRocket: null,
      currentPoints: 0,
      fontLoaded: false,
      questionOrder: [...Array(11).keys()].slice(1),
      screen: 'Splash',
      timer: 0,
      userName: '',
      userPicture: null,
    };

    this.ticker();
    this.loadDBKeys();
  }

  // Default Functions

  async componentDidMount() {
    await Font.loadAsync({
      'Skarparegular': require('./assets/fonts/Skarparegular.ttf'),
    });

    this.setState({ fontLoaded: true });

    BackHandler.addEventListener('hardwareBackPress', () => { return this.backHandler() });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress');
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        {this.getScreen()}
      </View>
    );
  }

  // DB Functions

  async loadDBKeys() {
    try {
      let userName = await AsyncStorage.getItem('@App:userName');
      let userPicture = await AsyncStorage.getItem('@App:userPicture');

      this.setState({ userName: userName });
      this.setState({ userPicture: userPicture });
    } catch (error) {
      console.log(error);
    }
  }

  async saveDBKey(key, value) {
    await AsyncStorage.setItem('@App:' + key, value);
  }

  // Helper Functions

  backHandler() {
    switch (this.state.screen) {
      case 'User':
        this.updateScreen('Start');
        return true;
      case 'Menu':
        this.updateScreen('User');
        return true;
      case 'Game3':
        Alert.alert(
          'Voltar',
          'Tem certeza que deseja retornar para o menu inicial?\n\nSeu progresso será perdido.',
          [
            { text: 'NÃO' },
            { text: 'SIM', onPress: () => { this.updateScreen('Menu'); } },
          ],
          { cancelable: true }
        );

        return true;
      case 'Splash':
      case 'Start':
      default:
        Alert.alert(
          'Sair',
          'Tem certeza que deseja sair do aplicativo?',
          [
            { text: 'NÃO' },
            { text: 'SIM', onPress: BackHandler.exitApp },
          ],
          { cancelable: true }
        );

        return true;
    }
  }

  changeUserName(userName) {
    this.setState({ userName: userName.substring(0, 32) });
  }

  getScreen() {
    switch (this.state.screen) {
      case 'Splash':
        return (
          <View style={styles.content}>
            {
              this.state.fontLoaded ? (
                <Text style={styles.appTitle}>{appName}</Text>
              ) : null
            }
            <Image
              source={require(appIcon)}
              style={styles.appIcon} />
          </View>
        );
      case 'Start':
        return (
          <View style={styles.content}>
            {
              this.state.animationRocket &&
              <Lottie
                ref={animation => {
                  this.animation = animation;
                }}
                source={this.state.animationRocket}
                style={styles.animationRocket} />
            }
            <Button block
              onPress={() => { this.updateScreen('User') }}
              style={[styles.button, styles.marginTop50]}
            >
              <Text style={styles.textButton}>INICIAR</Text>
            </Button>
          </View >
        );
      case 'User':
      case 'EditUser':
        return (
          <View style={styles.content}>
            <TouchableHighlight
              style={styles.userPictureButton}
              onPress={this.pickUserPicture}
            >
              <Image
                source={this.state.userPicture ? { uri: this.state.userPicture } : require(userPictureDefault)}
                style={styles.userPicture} />
            </TouchableHighlight>
            <Item style={[styles.inputTextItem, styles.marginTop50]}>
              <Input
                onChangeText={(userName) => this.changeUserName(userName)}
                placeholder='Nome'
                placeholderTextColor='#7D8990'
                style={styles.inputText}
                value={this.state.userName} />
            </Item>
            <Button block
              disabled={this.state.userName === ''}
              onPress={async () => {
                try {
                  this.saveDBKey('userName', this.state.userName);
                  this.saveDBKey('userPicture', this.state.userPicture);
                } catch (error) {
                  console.log(error);
                }

                this.updateScreen('Menu');
              }}
              style={[this.state.userName === '' ? styles.buttonDisabled : styles.button, styles.marginTop25]}
            >
              <Text style={styles.textButton}>SALVAR</Text>
            </Button>
          </View>
        );
      case 'Menu':
        return (
          <View style={styles.content}>
            <Button block
              disabled={true}
              onPress={() => { }}
              style={styles.buttonDisabled}
            >
              <Text style={styles.textButton}>Caçador de Palavras</Text>
            </Button>
            <Button block
              disabled={true}
              onPress={() => { }}
              style={[styles.buttonDisabled, styles.marginTop25]}
            >
              <Text style={styles.textButton}>Palavra Certa</Text>
            </Button>
            <Button block
              onPress={() => { this.updateScreen('Game3') }}
              style={[styles.button, styles.marginTop25]}
            >
              <Text style={styles.textButton}>Autoaprendizagem</Text>
            </Button>
          </View >
        );
      case 'Game3':
        return (
          <View style={styles.screen}>
            <View style={styles.header}>
            </View>
            <View style={styles.content}>
            </View>
            <View style={styles.footer}>
              {
                this.state.actualQuestion > 0 ?
                  <Button block
                    onPress={() => {
                      this.setState(previousState => {
                        return { actualQuestion: --previousState.actualQuestion };
                      });
                    }}
                    style={[styles.button]}
                  >
                    <Text style={styles.textButton}>Voltar</Text>
                  </Button> : null
              }
              {
                this.state.actualQuestion < 10 ?
                  <Button block
                    onPress={() => {
                      this.setState(previousState => {
                        return { actualQuestion: ++previousState.actualQuestion };
                      });
                    }}
                    style={[styles.button]}
                  >
                    <Text style={styles.textButton}>Entendi</Text>
                  </Button> : null
              }
            </View>
          </View>
        );
      default:
        return null;
    }
  }

  pickUserPicture = async () => {
    this.setState({ userPicture: null });

    let selectedPicture = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      height: '128px',
      width: '128px',
    });

    if (!selectedPicture.cancelled) {
      this.setState({ userPicture: selectedPicture.uri });
    }
  }

  playAnimation = (animationName) => {
    let changeState = false;

    switch (animationName) {
      case 'rocket':
        if (!this.state.animationRocket) {
          changeState = { animationRocket: rocketAnimation };
        }
        break;
    }

    if (changeState) {
      this.setState(changeState, () => { this.playAnimation(animationName) });
    }

    if (this.animation) {
      this.animation.play();
    }
  }

  ticker() {
    setTimeout(() => {
      if (this.state.fontLoaded) {
        if (this.state.timer === splashTimer) {
          this.updateScreen('Game3');
        }

        this.setState(previousState => {
          return { timer: ++previousState.timer };
        });
      }

      this.ticker();
    }, 1000);
  }

  updateScreen(screenName) {
    let beforeScreen = this.state.screen;

    this.setState({ screen: screenName });

    switch (screenName) {
      case 'Start':
        this.playAnimation('rocket');
        break;
      case 'User':
      case 'EditUser':
        if (this.state.userName === '' || screenName === 'EditUser') {
          this.loadDBKeys();
        } else {
          if (beforeScreen === 'Start') {
            this.updateScreen('Menu');
          } else {
            this.updateScreen('Start');
          }
        }
        break;
      case 'Game3':
        this.setState({ actualQuestion: 0 });
        this.setState({ currentPoints: 0 });
        this.setState({ questionOrder: ([...Array(11).keys()].slice(1)).sort(() => Math.random() - 0.5) });
        break;
      default:
        break;
    }
  }
}

// Styles

const styles = StyleSheet.create({
  animationRocket: {
    height: 256,
    width: 256,
  },
  appIcon: {
    height: 256,
    width: 256,
  },
  appTitle: {
    color: '#D2A253',
    fontFamily: 'Skarparegular',
    fontSize: 72,
  },
  button: {
    backgroundColor: '#78CBF5',
    height: 50,
  },
  buttonDisabled: {
    height: 50,
    width: '100%',
  },
  buttonX {

  },
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    width: '100%'
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '90%',
  },
  footer: {
    flexDirection: 'row',
    height: 75,
    justifyContent: 'space-between',
    width: '90%',
  },
  header: {
    backgroundColor: '#FA7447',
    height: 75,
    width: '100%',
  },
  inputText: {
    color: '#7D8990',
    fontSize: 20,
  },
  inputTextItem: {
    borderColor: '#7D8990',
  },
  marginTop25: {
    marginTop: 25,
  },
  marginTop50: {
    marginTop: 50,
  },
  screen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  textButton: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userPicture: {
    borderRadius: 64,
    height: 128,
    width: 128,
  },
  userPictureButton: {
    borderRadius: 64,
  }
});