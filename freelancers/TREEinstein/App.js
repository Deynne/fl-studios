import { DangerZone, Font, ImagePicker } from "expo";
import { Body, Button, CheckBox, Input, Item, ListItem } from "native-base";
import React from "react";
import {
  Alert,
  AsyncStorage,
  BackHandler,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  WebView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import rocketAnimation from "./assets/lotties/bms-rocket.json";
import starAnimation from "./assets/lotties/favourite_app_icon.json";

const { Lottie } = DangerZone;

const appName = "TRE Einstein";
const appIcon = "./assets/images/app-icon.png";
const questions = [
  {
    options: [
      { correct: false, id: 1, option: "Tiradentes" },
      { correct: true, id: 2, option: "Pedro Álvares Cabral" },
      { correct: false, id: 3, option: "Dom Pedro II" },
      { correct: false, id: 4, option: "Luis Inácio Lula da Silva" },
      { correct: false, id: 5, option: "Cristovão Colombo" }
    ],
    question:
      "No jogo da autoaprendizagem, você deve marcar a alternativa correta. Por exemplo:<br /><br /><strong>Quem descobriu o Brasil?</strong>"
  },
  {
    options: [
      { correct: false, id: 1, option: "A teoria da natureza da luz." },
      { correct: false, id: 2, option: "A teoria das cordas." },
      { correct: false, id: 3, option: "A teoria atômica de Bohr." },
      { correct: false, id: 4, option: "A teoria da relatividade de Galileu." },
      { correct: true, id: 5, option: "A teoria da relatividade de Einstein." }
    ],
    question:
      "A palavra <strong>relatividade</strong> não foi criada por Einstein, muito embora seja comum ligá-lo ao termo como se fosse o criador da relatividade. Galileu cerca de 300 anos antes, já usava com maestria a relatividade nas interpretações de problemas cinemáticos. Toda via, o significado da palavra relatividade sofreu várias modelagens no meio acadêmico, principalmente quando se constatou a velocidade da luz como uma quantidade absoluta. A teoria que evidencia esse fato e que a partir da qual a concepção cotidiana de tempo e espaço sofrem alterações radicais é:"
  },
  {
    options: [
      {
        correct: false,
        id: 1,
        option:
          "Segundo Galileu, a velocidade da luz era 1000 vezes maior que a do som, por isso, se enxergava o relâmpago e só depois se ouve o trovão durante uma tempestade."
      },
      {
        correct: false,
        id: 2,
        option: "Segundo Newton, a velocidade da luz é instantânea e infinita."
      },
      {
        correct: false,
        id: 3,
        option:
          "Segundo Newton, a luz, ao penetrar na água, tem sua velocidade reduzida pois a água é um meio resistivo."
      },
      {
        correct: true,
        id: 4,
        option: "Segundo Fermat, a luz tem velocidade maior no ar que na água."
      },
      {
        correct: false,
        id: 5,
        option:
          "Einstein aceitou o modelo ondulatório da luz como sendo o modelo mais adequado, e esse é o que prevalece até hoje."
      }
    ],
    question:
      "A respeito da velocidade e natureza da luz, marque a alternativa correta:"
  }
];
const splashTimer = 0;
const userPictureDefault = "./assets/images/userPicture-default.png";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      actualQuestion: 0,
      animationRocket: null,
      animationStar: null,
      answers: [...Array(questions.length)],
      currentPoints: 0,
      fontLoaded: false,
      questionOrder: Array.from(
        new Array(questions.length - 1),
        (v, i) => i + 1
      ),
      screen: "Splash",
      timer: 0,
      userName: "",
      userPicture: null
    };

    this.ticker();
    this.loadDBKeys();
  }

  // Default Functions

  async componentDidMount() {
    await Font.loadAsync({
      Skarparegular: require("./assets/fonts/Skarparegular.ttf")
    });

    this.setState({ fontLoaded: true });

    BackHandler.addEventListener("hardwareBackPress", () => {
      return this.backHandler();
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress");
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
      let userName = await AsyncStorage.getItem("@App:userName");
      let userPicture = await AsyncStorage.getItem("@App:userPicture");

      this.setState({ userName: userName });
      this.setState({ userPicture: userPicture });
    } catch (error) {
      console.log(error);
    }
  }

  async saveDBKey(key, value) {
    await AsyncStorage.setItem("@App:" + key, value);
  }

  // Helper Functions

  backHandler() {
    switch (this.state.screen) {
      case "User":
        this.updateScreen("Start");
        return true;
      case "Menu":
        this.updateScreen("User");
        return true;
      case "Game3":
        Alert.alert(
          "Voltar",
          "Tem certeza que deseja retornar para o menu inicial?\n\nSeu progresso será perdido.",
          [
            { text: "NÃO" },
            {
              text: "SIM",
              onPress: () => {
                this.updateScreen("Menu");
              }
            }
          ],
          { cancelable: true }
        );

        return true;
      case "Splash":
      case "Start":
      default:
        Alert.alert(
          "Sair",
          "Tem certeza que deseja sair do aplicativo?",
          [{ text: "NÃO" }, { text: "SIM", onPress: BackHandler.exitApp }],
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
      case "Splash":
        return (
          <View style={styles.content}>
            {this.state.fontLoaded ? (
              <Text style={styles.appTitle}>{appName}</Text>
            ) : null}
            <Image source={require(appIcon)} style={styles.appIcon} />
          </View>
        );
      case "Start":
        return (
          <View style={styles.content}>
            {this.state.animationRocket && (
              <Lottie
                ref={animation => {
                  this.animation = animation;
                }}
                source={this.state.animationRocket}
                style={styles.animationRocket}
              />
            )}
            <Button
              block
              onPress={() => {
                this.updateScreen("User");
              }}
              style={[styles.button, styles.marginTop50]}
            >
              <Text style={styles.textDefault}>INICIAR</Text>
            </Button>
          </View>
        );
      case "User":
      case "EditUser":
        return (
          <View style={styles.content}>
            <TouchableHighlight
              style={styles.userPictureButton}
              onPress={this.pickUserPicture}
            >
              <Image
                source={
                  this.state.userPicture
                    ? { uri: this.state.userPicture }
                    : require(userPictureDefault)
                }
                style={styles.userPicture}
              />
            </TouchableHighlight>
            <Item style={[styles.inputTextItem, styles.marginTop50]}>
              <Input
                onChangeText={userName => this.changeUserName(userName)}
                placeholder="Nome"
                placeholderTextColor="#7D8990"
                style={styles.inputText}
                value={this.state.userName}
              />
            </Item>
            <Button
              block
              disabled={this.state.userName === ""}
              onPress={async () => {
                try {
                  this.saveDBKey("userName", this.state.userName);
                  this.saveDBKey("userPicture", this.state.userPicture);
                } catch (error) {
                  console.log(error);
                }

                this.updateScreen("Menu");
              }}
              style={[
                this.state.userName === ""
                  ? styles.buttonDisabled
                  : styles.button,
                styles.marginTop25
              ]}
            >
              <Text style={styles.textDefault}>SALVAR</Text>
            </Button>
          </View>
        );
      case "Menu":
        return (
          <View style={styles.screen}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.textDefault}>{this.state.userName}</Text>
                <TouchableHighlight
                  style={styles.userPictureMenu}
                  onPress={() => {
                    this.updateScreen("EditUser");
                  }}
                >
                  <Image
                    source={
                      this.state.userPicture
                        ? { uri: this.state.userPicture }
                        : require(userPictureDefault)
                    }
                    style={styles.userPictureMenu}
                  />
                </TouchableHighlight>
              </View>
            </View>
            <View style={styles.content}>
              <Button
                block
                disabled={true}
                onPress={() => {}}
                style={styles.buttonDisabled}
              >
                <Text style={styles.textDefault}>Caçador de Palavras</Text>
              </Button>
              <Button
                block
                disabled={true}
                onPress={() => {}}
                style={[styles.buttonDisabled, styles.marginTop25]}
              >
                <Text style={styles.textDefault}>Palavra Certa</Text>
              </Button>
              <Button
                block
                onPress={() => {
                  this.updateScreen("Game3");
                }}
                style={[styles.button, styles.marginTop25]}
              >
                <Text style={styles.textDefault}>Autoaprendizagem</Text>
              </Button>
            </View>
          </View>
        );
      case "Game3":
        let heightEnable =
          Dimensions.get("window").height -
          (Dimensions.get("window").height * 0.03 + 150);
        return (
          <View style={styles.screen}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.textDefault}>
                  {this.state.actualQuestion === 0
                    ? "Instruções"
                    : this.state.actualQuestion + "ª Pergunta"}
                </Text>
                <TouchableHighlight
                  style={styles.headerOption}
                  onPress={() => {
                    this.backHandler();
                  }}
                >
                  <Ionicons name="md-menu" style={[styles.textDefault]} />
                </TouchableHighlight>
              </View>
            </View>
            <View style={styles.contentFull}>
              <WebView
                source={{
                  html:
                    "<p style='font-size: 16; text-align: justify;'>" +
                    (this.state.actualQuestion === 0
                      ? questions[0].question
                      : questions[
                          this.state.questionOrder[
                            this.state.actualQuestion - 1
                          ]
                        ].question) +
                    "</p>"
                }}
                style={[
                  styles.contentQuestions,
                  {
                    maxHeight: 0.35 * heightEnable,
                    minHeight: 0.35 * heightEnable
                  }
                ]}
              />
              <ScrollView
                style={[
                  styles.contentScroll,
                  {
                    maxHeight: 0.65 * heightEnable,
                    minHeight: 0.65 * heightEnable
                  }
                ]}
              >
                {questions[
                  this.state.actualQuestion === 0
                    ? 0
                    : this.state.questionOrder[this.state.actualQuestion - 1]
                ].options.map((i, k) => {
                  return (
                    <ListItem
                      key={k}
                      onPress={
                        this.state.actualQuestion === 0
                          ? () => {}
                          : () => {
                              this.selectAnswer(
                                this.state.questionOrder[
                                  this.state.actualQuestion - 1
                                ],
                                i.id
                              );
                            }
                      }
                    >
                      <CheckBox
                        checked={
                          (i.correct && this.state.actualQuestion === 0) ||
                          (typeof this.state.answers[
                            this.state.questionOrder[
                              this.state.actualQuestion - 1
                            ]
                          ] !== "undefined" &&
                            this.state.answers[
                              this.state.questionOrder[
                                this.state.actualQuestion - 1
                              ]
                            ] ===
                              i.id - 1)
                        }
                        color={
                          this.state.actualQuestion === 0
                            ? "#000000"
                            : "#78CBF5"
                        }
                        onPress={
                          this.state.actualQuestion === 0
                            ? () => {}
                            : () => {
                                this.selectAnswer(
                                  this.state.questionOrder[
                                    this.state.actualQuestion - 1
                                  ],
                                  i.id
                                );
                              }
                        }
                      />
                      <Body style={styles.checkedBox}>
                        <Text>{i.option}</Text>
                      </Body>
                    </ListItem>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.footer}>
              {this.state.actualQuestion > 0 &&
              this.state.actualQuestion < questions.length ? (
                <Button
                  block
                  onPress={() => {
                    this.setState(previousState => {
                      return { actualQuestion: --previousState.actualQuestion };
                    });
                  }}
                  style={[
                    styles.button,
                    this.state.actualQuestion < questions.length
                      ? styles.twoButtonsRight
                      : null
                  ]}
                >
                  <Ionicons name="ios-arrow-back" style={styles.textDefault} />
                  <Ionicons name="ios-arrow-back" style={styles.textDefault} />
                </Button>
              ) : null}
              {this.state.actualQuestion < questions.length ? (
                <Button
                  block
                  disabled={
                    this.state.actualQuestion === questions.length - 1 &&
                    !this.questionsAnswereds()
                  }
                  onPress={
                    this.state.actualQuestion === questions.length - 1 &&
                    this.questionsAnswereds()
                      ? () => {
                          let totalPoints = 0;

                          for (answer in this.state.answers) {
                            answer = parseInt(answer);
                            if (answer > 0) {
                              if (
                                questions[answer].options[
                                  this.state.answers[answer]
                                ].correct
                              ) {
                                totalPoints += 10;
                              }
                            }
                          }

                          this.setState({ currentPoints: totalPoints });

                          this.updateScreen("Points");
                        }
                      : () => {
                          this.setState(previousState => {
                            return {
                              actualQuestion: ++previousState.actualQuestion
                            };
                          });
                        }
                  }
                  style={[
                    this.state.actualQuestion === questions.length - 1 &&
                    !this.questionsAnswereds()
                      ? styles.buttonDisabled
                      : styles.button,
                    this.state.actualQuestion > 0 ? styles.twoButtonsLeft : null
                  ]}
                >
                  {this.state.actualQuestion === questions.length - 1 ? (
                    <Ionicons name="md-done-all" style={styles.textDefault} />
                  ) : (
                    <View style={{ flexDirection: "row" }}>
                      <Ionicons
                        name="ios-arrow-forward"
                        style={styles.textDefault}
                      />
                      <Ionicons
                        name="ios-arrow-forward"
                        style={styles.textDefault}
                      />
                    </View>
                  )}
                </Button>
              ) : null}
            </View>
          </View>
        );
      case "Points":
        return (
          <View style={styles.content}>
            {this.state.animationStar && (
              <Lottie
                ref={animation => {
                  this.animation = animation;
                }}
                source={this.state.animationStar}
                style={styles.animationStar}
              />
            )}
            <View style={styles.points}>
              <Text style={styles.textPoints}>{this.state.currentPoints}</Text>
            </View>
            <Button
              block
              onPress={() => {
                this.updateScreen("Menu");
              }}
              style={[styles.button, styles.marginTop50]}
            >
              <Text style={styles.textDefault}>VOLTAR AO MENU</Text>
            </Button>
          </View>
        );
        break;
      default:
        return null;
    }
  }

  pickUserPicture = async () => {
    this.setState({ userPicture: null });

    let selectedPicture = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      height: "128px",
      width: "128px"
    });

    if (!selectedPicture.cancelled) {
      this.setState({ userPicture: selectedPicture.uri });
    }
  };

  playAnimation = animationName => {
    let changeState = false;

    switch (animationName) {
      case "rocket":
        if (!this.state.animationRocket) {
          changeState = { animationRocket: rocketAnimation };
        }
        break;
      case "star":
        if (!this.state.animationStar) {
          changeState = { animationStar: starAnimation };
        }
        break;
    }

    if (changeState) {
      this.setState(changeState, () => {
        this.playAnimation(animationName);
      });
    }

    if (this.animation) {
      this.animation.play();
    }
  };

  questionsAnswereds() {
    return (
      this.state.answers.filter(i => typeof i !== "undefined").length ===
      this.state.questionOrder.length
    );
  }

  selectAnswer = (question, answer) => {
    this.setState(previousState => {
      previousState.answers[question] =
        previousState.answers[question] === answer - 1 ? undefined : answer - 1;

      return { answers: previousState.answers };
    });
  };

  ticker() {
    setTimeout(() => {
      if (this.state.fontLoaded) {
        if (this.state.timer === splashTimer) {
          this.updateScreen("Start");
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
      case "Start":
        this.playAnimation("rocket");
        break;
      case "User":
      case "EditUser":
        if (this.state.userName === "" || screenName === "EditUser") {
          this.loadDBKeys();
        } else {
          if (beforeScreen === "Start") {
            this.updateScreen("Menu");
          } else {
            this.updateScreen("Start");
          }
        }
        break;
      case "Game3":
        this.setState({ actualQuestion: 0 });
        this.setState({ currentPoints: 0 });
        this.setState({ answers: [...Array(questions.length)] });
        this.setState({
          questionOrder: Array.from(
            new Array(questions.length - 1),
            (v, i) => i + 1
          ).sort(() => Math.random() - 0.5)
        });
        break;
      case "Points":
        this.playAnimation("star");
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
    width: 256
  },
  animationStar: {
    height: 128,
    transform: [{ scale: 7 }],
    width: 128
  },
  appIcon: {
    height: 256,
    width: 256
  },
  appTitle: {
    color: "#D2A253",
    fontFamily: "Skarparegular",
    fontSize: 72
  },
  button: {
    backgroundColor: "#78CBF5",
    height: 50
  },
  buttonDisabled: {
    height: 50,
    width: "100%"
  },
  twoButtonsLeft: {
    marginLeft: "5%",
    width: "45%"
  },
  twoButtonsRight: {
    marginRight: "5%",
    width: "45%"
  },
  checkedBox: {
    paddingLeft: 10
  },
  container: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "center",
    width: "100%"
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "90%"
  },
  contentFull: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "100%"
  },
  contentQuestions: {
    marginBottom: "1%",
    marginTop: "1%",
    maxWidth: "100%",
    minWidth: "100%",
    paddingLeft: "5%",
    paddingRight: "5%"
  },
  contentScroll: {
    marginBottom: "1%",
    minWidth: "100%",
    paddingLeft: "4%",
    paddingRight: "4%"
  },
  footer: {
    alignItems: "center",
    flexWrap: "wrap",
    flexDirection: "column",
    height: 75,
    width: "90%"
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FA7447",
    height: 75,
    justifyContent: "center",
    width: "100%"
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%"
  },
  headerOption: {
    height: "100%",
    justifyContent: "center"
  },
  inputText: {
    color: "#7D8990",
    fontSize: 20
  },
  inputTextItem: {
    borderColor: "#7D8990"
  },
  marginTop25: {
    marginTop: 25
  },
  marginTop50: {
    marginTop: 50
  },
  points: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    position: "absolute"
  },
  screen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    width: "100%"
  },
  textDefault: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold"
  },
  textPoints: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "bold"
  },
  userPicture: {
    borderRadius: 64,
    height: 128,
    width: 128
  },
  userPictureButton: {
    borderRadius: 64
  },
  userPictureMenu: {
    borderRadius: 32,
    height: 64,
    width: 64
  }
});
