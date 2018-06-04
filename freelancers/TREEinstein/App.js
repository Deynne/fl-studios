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
import starAnimation from "./assets/lotties/star.json";

const { Lottie } = DangerZone;

const appName = "TRE Einstein";
const appIcon = "./assets/images/app-icon.png";
const imageQuestion5 = "./assets/images/question-5.png";
const imageQuestion10 = "./assets/images/question-10.png";
const markdownLogo = "./assets/images/markdown-logo.jpg";
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
      signed: false,
      timer: 0,
      userName: "",
      userPicture: null
    };

    this.ticker();
    this.loadDBKeys();
  }

  // Default Functions

  componentDidMount = async () => {
    await Font.loadAsync({
      Skarparegular: require("./assets/fonts/Skarparegular.ttf")
    });

    this.setState({ fontLoaded: true });

    BackHandler.addEventListener("hardwareBackPress", () => {
      return this.backHandler();
    });
  };

  componentWillUnmount = () => {
    BackHandler.removeEventListener("hardwareBackPress");
  };

  render = () => {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <Image source={require(markdownLogo)} style={styles.markdownLogo} />
        {this.getScreen()}
      </View>
    );
  };

  // DB Functions

  loadDBKeys = async () => {
    try {
      let signed = await AsyncStorage.getItem("@App:signed");
      let userName = await AsyncStorage.getItem("@App:userName");
      let userPicture = await AsyncStorage.getItem("@App:userPicture");

      this.setState({ signed: !(signed === null) });
      this.setState({ userName: userName === null ? "" : userName });
      this.setState({ userPicture: userPicture });
    } catch (error) {
      console.log(error);
    }
  };

  saveDBKey = async (key, value) => {
    await AsyncStorage.setItem("@App:" + key, value);
  };

  // Helper Functions

  backHandler = () => {
    switch (this.state.screen) {
      case "User":
      case "EditUser":
        if (this.state.signed) {
          this.updateScreen("Menu");
        } else {
          this.setState({ signed: false });
          this.setState({ userName: "" });
          this.setState({ userPicture: null });

          this.updateScreen("Start");
        }
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
  };

  changeUserName = userName => {
    this.setState({ userName: userName.substring(0, 32) });
  };

  getScreen = () => {
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
                  this.setState({ signed: true });

                  this.saveDBKey("signed", "true");
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
              <ScrollView
                ref={scroller => {
                  this.scroller = scroller;
                }}
                onContentSizeChange={(w, h)=>{
                  this.scroller.scrollTo({ x: 0, y: 0 });
              }}
                style={styles.contentScroll}
              >
                <View style={styles.contentQuestions}>
                  {this.state.actualQuestion === 0
                    ? questions[0].question
                    : questions[
                        this.state.questionOrder[this.state.actualQuestion - 1]
                      ].question}
                </View>
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
                      style={{ marginLeft: 0 }}
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
              style={[styles.button]}
            >
              <Text style={styles.textDefault}>CONTINUAR</Text>
            </Button>
          </View>
        );
        break;
      default:
        return null;
    }
  };

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

  questionsAnswereds = () => {
    return (
      this.state.answers.filter(i => typeof i !== "undefined").length ===
      this.state.questionOrder.length
    );
  };

  selectAnswer = (question, answer) => {
    this.setState(previousState => {
      previousState.answers[question] =
        previousState.answers[question] === answer - 1 ? undefined : answer - 1;

      return { answers: previousState.answers };
    });
  };

  ticker = () => {
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
  };

  updateScreen = screenName => {
    let beforeScreen = this.state.screen;

    this.setState({ screen: screenName });

    switch (screenName) {
      case "Start":
        this.playAnimation("rocket");
        break;
      case "User":
      case "EditUser":
        if (!this.state.signed || screenName === "EditUser") {
          this.loadDBKeys();
        } else {
          if (beforeScreen === "Start") {
            this.updateScreen("Menu");
          } else {
            this.updateScreen("Start");
          }
        }
        break;
      case "Menu":
        this.loadDBKeys();
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
  };
}

// Styles

const styles = StyleSheet.create({
  animationRocket: {
    height: 256,
    width: 256
  },
  animationStar: {
    height: 300,
    transform: [{ scale: 4 }],
    width: 246
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
  breakLine: {
    marginTop: "1%",
    marginBottom: "1%"
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
    marginBottom: "2%"
  },
  contentScroll: {
    marginTop: "2%",
    marginBottom: "2%",
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
  imageQuestion: {
    resizeMode: "contain",
    width: "100%"
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
  markdownLogo: {
    opacity: 0.025,
    position: "absolute"
  },
  points: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 50,
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
  textQuestion: {
    fontSize: 18
  },
  textStrong: {
    fontSize: 18,
    fontWeight: "bold"
  },
  textItalic: {
    fontSize: 18,
    fontStyle: "italic"
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

const questions = [
  {
    options: [
      { correct: false, id: 1, option: "Tiradentes" },
      { correct: true, id: 2, option: "Pedro Álvares Cabral" },
      { correct: false, id: 3, option: "Dom Pedro II" },
      { correct: false, id: 4, option: "Luis Inácio Lula da Silva" },
      { correct: false, id: 5, option: "Cristovão Colombo" }
    ],
    question: (
      <View>
        <Text style={styles.textQuestion}>
          No jogo da autoaprendizagem, você deve marcar a alternativa correta.
          Por exemplo:
        </Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textStrong}>Quem descobriu o Brasil?</Text>
      </View>
    )
  },
  {
    options: [
      { correct: false, id: 1, option: "A teoria da natureza da luz." },
      { correct: false, id: 2, option: "A teoria das cordas." },
      { correct: false, id: 3, option: "A teoria atômica de Bohr." },
      { correct: false, id: 4, option: "A teoria da relatividade de Galileu." },
      { correct: true, id: 5, option: "A teoria da relatividade de Einstein." }
    ],
    question: (
      <Text>
        <Text style={styles.textQuestion}>A palavra</Text>
        <Text style={styles.textStrong}> relatividade </Text>
        <Text style={styles.textQuestion}>
          não foi criada por Einstein, muito embora seja comum ligá-lo ao termo
          como se fosse o criador desta. Galileu cerca de 300 anos antes, já
          usava com maestria a relatividade nas interpretações de problemas
          cinemáticos. Toda via, o significado da palavra relatividade sofreu
          várias modelagens no meio acadêmico, principalmente quando se
          constatou a velocidade da luz como uma quantidade absoluta. A teoria
          que evidencia esse fato e que a partir da qual a concepção cotidiana
          de tempo e espaço sofrem alterações radicais é:
        </Text>
      </Text>
    )
  },
  {
    options: [
      {
        correct: false,
        id: 1,
        option:
          "Segundo Galileu, a velocidade da luz era 1000 vezes maior que a do som, por isso, se enxergava o relâmpago e só depois se ouvia o trovão durante uma tempestade."
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
    question: (
      <Text style={styles.textQuestion}>
        A respeito da velocidade da luz e sua natureza. Assina a alternativa
        correta:
      </Text>
    )
  },
  {
    options: [
      {
        correct: false,
        id: 1,
        option: "A velocidade de uma onda independe do meio de propagação."
      },
      {
        correct: false,
        id: 2,
        option: "A velocidade do som é maior no ar que no sólido."
      },
      {
        correct: true,
        id: 3,
        option:
          "No vácuo, todas as ondas eletromagnéticas possuem a mesma velocidade."
      },
      { correct: false, id: 4, option: "A luz só tem natureza corpuscular." },
      { correct: false, id: 5, option: "A luz só tem natureza ondulatória." }
    ],
    question: (
      <Text style={styles.textQuestion}>
        Entre as afirmativas a seguir, assinale a que é verdadeira.
      </Text>
    )
  },
  {
    options: [
      {
        correct: false,
        id: 1,
        option:
          "Mesmo comprovando a existência do éter, Michelson continuou a buscar resultados cada vez mais precisos para o valor da velocidade da luz."
      },
      {
        correct: false,
        id: 2,
        option:
          "O experimento foi criado com o propósito de comprovar a não existência do éter e teve como consequência, o fato da luz não necessitar de um meio material para se propagar."
      },
      {
        correct: false,
        id: 3,
        option:
          "O fracasso da experiência de Michelson e Morley, teve como consequências a constância da velocidade da luz no vácuo para qualquer referencial inercial. E com isso, a comprovação da existência do éter."
      },
      {
        correct: true,
        id: 4,
        option:
          "O resultado da experiência de Michelson foi que: a velocidade da luz no vácuo é a mesma em qualquer referencial inercial, o éter era uma invenção equivocada dos físicos do século XIX e que as transformações de Galileu falhavam para velocidades comparáveis a velocidade da luz."
      },
      {
        correct: false,
        id: 5,
        option:
          "A constância da velocidade da luz, verificada com a experiência de Michelson e Morley, forçaram uma total invalidação das transformações de Galileu."
      }
    ],
    question: (
      <Text style={styles.textQuestion}>
        A cerca do propósito e dos resultados obtidos pelo Experimento de
        Michelson e Morley, é correto afirmar:
      </Text>
    )
  },
  {
    options: [
      { correct: true, id: 1, option: "I e IV" },
      { correct: false, id: 2, option: "I e II" },
      { correct: false, id: 3, option: "III e IV" },
      { correct: false, id: 4, option: "II e III" },
      { correct: false, id: 5, option: "II e IV" }
    ],
    question: (
      <View>
        <Text style={styles.textQuestion}>
          Considere as figuras e admita que tais velocidades sejam possíveis de
          serem alcançadas.
        </Text>
        <Image source={require(imageQuestion5)} style={styles.imageQuestion} />
        <Text style={styles.textQuestion}>
          <Text>
            As velocidades em relação a um referencial fixo na Terra são:
          </Text>
          <Text style={styles.textItalic}> 70km/h, 100km/h, 0,1c </Text>
          <Text>para os veículos:</Text>
          <Text style={styles.textItalic}> A, B, D </Text>
          <Text>respectivamente e</Text>
          <Text style={styles.textItalic}> c </Text>
          <Text>para o feixe luminoso.</Text>
        </Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textStrong}>Examine as proposições:</Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textQuestion}>
          <Text style={styles.textStrong}>I. </Text>
          <Text>
            A velocidade com que um observador fixo na Terra percebe o veículo
          </Text>
          <Text style={styles.textItalic}> B </Text>
          <Text>afastar-se do veículo</Text>
          <Text style={styles.textItalic}> A </Text>
          <Text>é de</Text>
          <Text style={styles.textItalic}> 30km/h (100km/h – 70km/h)</Text>
          <Text>.</Text>
        </Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textQuestion}>
          <Text style={styles.textStrong}>II. </Text>
          <Text>
            A velocidade com que um observador fixo na Terra percebe a luz
            emitida pelo laser afastar-se do veículo
          </Text>
          <Text style={styles.textItalic}> D </Text>
          <Text>é de</Text>
          <Text style={styles.textItalic}> 0,9c (c – 0,1c)</Text>
          <Text>.</Text>
        </Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textQuestion}>
          <Text style={styles.textStrong}>III. </Text>
          <Text>
            A velocidade com que um observador fixo na Terra percebe o veículo
          </Text>
          <Text style={styles.textItalic}> B </Text>
          <Text>afastar-se do veículo</Text>
          <Text style={styles.textItalic}> A </Text>
          <Text>é de</Text>
          <Text style={styles.textItalic}> 100km/h</Text>
          <Text>.</Text>
        </Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textQuestion}>
          <Text style={styles.textStrong}>IV. </Text>
          <Text>
            A velocidade com que um observador fixo na Terra percebe a luz
            emitida pelo laser afastar-se do veículo
          </Text>
          <Text style={styles.textItalic}> D </Text>
          <Text>é de</Text>
          <Text style={styles.textItalic}> c</Text>
          <Text>.</Text>
        </Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textStrong}>São proposições corretas:</Text>
      </View>
    )
  },
  {
    options: [
      { correct: false, id: 1, option: "Sendo V = c, então γ = 1" },
      { correct: false, id: 2, option: "Sendo V = 0, então γ = impossível" },
      { correct: false, id: 3, option: "Sendo V = 0,6c, então γ = 0,64" },
      { correct: false, id: 4, option: "Sendo V = 0,8c, então γ = 1,25" },
      { correct: true, id: 5, option: "Sendo V = 0,5c, então γ = 1 ,15" }
    ],
    question: (
      <View>
        <Text style={styles.textQuestion}>
          O fator de Lorentz ou coeficiente de Lorentz (γ), aparece no cenário
          da Física com o objetivo de incorporar os resultados do experimento de
          Michelson e Morley, afim de se obter expressões que satisfizesse a
          hipótese da contração do comprimento.
        </Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textQuestion}>
          <Text>Esse fator é de certa forma uma função da velocidade</Text>
          <Text style={styles.textItalic}> V</Text>
          <Text>, então:</Text>
        </Text>
      </View>
    )
  },
  {
    options: [
      {
        correct: false,
        id: 1,
        option:
          "Se dois eventos ocorrem num mesmo instante em um dado referencial inercial, dizemos que eles são simultâneos nesse referencial. Então, esses mesmos dois eventos serão necessariamente simultâneos em quaisquer outros referenciais inerciais."
      },
      {
        correct: false,
        id: 2,
        option:
          "Se dois eventos ocorrem num mesmo instante em um dado referencial inercial, dizemos que eles são não simultâneos nesse referencial. Então, esses mesmos dois eventos serão necessariamente não simultâneos em quaisquer outros referenciais inerciais."
      },
      {
        correct: true,
        id: 3,
        option:
          "Se dois eventos ocorrem num mesmo instante em um dado referencial inercial, dizemos que eles são simultâneos nesse referencial. Entretanto, esses mesmos eventos não serão necessariamente simultâneos em outros referenciais inerciais."
      },
      {
        correct: false,
        id: 4,
        option:
          "A ideia de simultaneidade só existe nas ciências humanísticas. Nas ciências exatas, nada é simultâneo, tudo é relativo."
      },
      {
        correct: false,
        id: 5,
        option:
          "A ideia de simultaneidade só existe nas ciências exatas. Nas ciências humanísticas, nada é simultâneo, tudo é relativo."
      }
    ],
    question: (
      <Text style={styles.textQuestion}>
        <Text>
          Um fato curioso oriundo dos desdobramentos dos postulados da
          Relatividade Especial é o
        </Text>
        <Text style={styles.textStrong}> “princípio da simultaneidade”</Text>
        <Text>, segundo esse princípio:</Text>
      </Text>
    )
  },
  {
    options: [
      { correct: true, id: 1, option: "90m e 0,375μs" },
      { correct: false, id: 2, option: "250m e 1,040μs" },
      { correct: false, id: 3, option: "54m e 0,225μs" },
      { correct: false, id: 4, option: "417m e 1,738μs" },
      { correct: false, id: 5, option: "120m e 0,400μs" }
    ],
    question: (
      <Text style={styles.textQuestion}>
        Uma nave de comprimento próprio 150m, é animada com uma velocidade de
        0,8c, relativamente a um observador. O comprimento da nave, medido pelo
        observador e o intervalo de tempo que a nave leva para passar pelo
        observador valem, respectivamente:
      </Text>
    )
  },
  {
    options: [
      { correct: false, id: 1, option: "4,0 e 0,375μs" },
      { correct: false, id: 2, option: "2,0 e 0,150μs" },
      { correct: true, id: 3, option: "2,0 e 0,750μs" },
      { correct: false, id: 4, option: "4,0 e 0,150μs" },
      { correct: false, id: 5, option: "4,0 e 0,750μs" }
    ],
    question: (
      <Text style={styles.textQuestion}>
        Um relógio desloca-se no sentido positivo do eixo x, desenvolvendo uma
        velocidade 0,866c. Ao passar pela origem (relativo à Terra), ele indica
        zero, isto é, em x=0m se tem t=0s. O fator de Lorentz nessa velocidade e
        a indicação do relógio ao passar pela posição 389,7m, são
        respectivamente:
      </Text>
    )
  },
  {
    options: [
      { correct: true, id: 1, option: "c e -c" },
      { correct: false, id: 2, option: "c e 0" },
      { correct: false, id: 3, option: "0 e -c" },
      { correct: false, id: 4, option: "0 e c" },
      { correct: false, id: 5, option: "2c e c" }
    ],
    question: (
      <View>
        <Text style={styles.textQuestion}>
          Dentro de um ônibus relativístico que se move com velocidade de 0,8c,
          relativamente à Terra (figura), uma lanterna emite um sinal luminoso
          no sentido oposto ao movimento do ônibus.
        </Text>
        <Image source={require(imageQuestion10)} style={styles.imageQuestion} />
        <Text style={styles.textQuestion}>
          A velocidade da luz emitida pela lanterna, em valor absoluto, medida
          por um observador dentro do ônibus e a velocidade da luz emitida pela
          lanterna, medida por um observador parado em relação à Terra, são
          respectivamente:
        </Text>
      </View>
    )
  }
];
