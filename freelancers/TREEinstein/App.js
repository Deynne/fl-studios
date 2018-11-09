import { DangerZone, Font, ImagePicker } from "expo";
import {
  Badge,
  Body,
  Button,
  CheckBox,
  Input,
  Item,
  ListItem
} from "native-base";
import React from "react";
import {
  Alert,
  Animated,
  AsyncStorage,
  BackHandler,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  PanResponder,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Vibration,
  View
} from "react-native";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import rocketAnimation from "./assets/lotties/bms-rocket.json";
import starAnimation from "./assets/lotties/star.json";

const { Lottie } = DangerZone;

const appName = "TRE Einstein";
const appIcon = "./assets/images/app-icon.png";
const blankSpaces = "_";
const imageQuestion5 = "./assets/images/question-5.png";
const imageQuestion10 = "./assets/images/question-10.png";
const markdownLogo = "./assets/images/markdown-logo.jpg";
const maxLinesGrid = 12;
const maxColumnsGrid = 30;
const splashTimer = 0;
const userPictureDefault = "./assets/images/userPicture-default.png";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      actualParagraph: null,
      actualQuestion: 0,
      actualSufix: "",
      actualTerm: "",
      actualTheme: null,
      animationRocket: null,
      animationStar: null,
      answers: [...Array(questions.length)],
      clock: null,
      currentPoints: 0,
      draggablePosition: { x: 0, y: 0 },
      draggableVisVisible: false,
      fontLoaded: false,
      gridStartPosition: {},
      instructionsTerms: [],
      pan: new Animated.ValueXY(),
      questionOrder: Array.from(
        new Array(questions.length - 1),
        (v, i) => i + 1
      ),
      screen: "Splash",
      showGrid: false,
      showInstructions: true,
      signed: false,
      termLayout: {},
      termLayoutAll: {},
      termsOrder: Array.from(new Array(10), (v, i) => i),
      termsPositions: {},
      timer: 0,
      userName: "",
      userPicture: null,
      vibrate: true,
      wordsSearchGame: wordsSearchGame,
      wordsSearchGameBoard: Array(maxLinesGrid)
        .fill()
        .map(() => Array(maxColumnsGrid).fill(null)),
      wordsSearchSelected: "",
      wordsSearchGameWordToFind: "",
      wrongTries: 0
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

  componentWillMount = () => {
    this.state.pan.addListener(value => {
      this.setState({ draggablePosition: value });
    });

    this.panResponder1 = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        this.state.pan.setOffset({
          x: this.state.draggablePosition.x,
          y: this.state.draggablePosition.y
        });

        this.state.pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),
      onPanResponderRelease: (e, gesture) => {
        if (
          gesture.moveX >
            this.state.termsPositions[this.getActualTermWithSufix()].x &&
          gesture.moveX <
            this.state.termsPositions[this.getActualTermWithSufix()].x +
              this.state.termsPositions[this.getActualTermWithSufix()].width &&
          gesture.moveY >
            this.state.termsPositions[this.getActualTermWithSufix()].y -
              this.state.termLayoutAll.yScroller &&
          gesture.moveY <
            this.state.termLayoutAll.yContent +
              this.state.termLayoutAll.yScroll +
              (this.state.termsPositions[this.getActualTermWithSufix()].y -
                this.state.termLayoutAll.yScroller) +
              this.state.termsPositions[this.getActualTermWithSufix()].height &&
          gesture.moveY >
            this.state.termLayoutAll.yContent + this.state.termLayoutAll.yScroll
        ) {
          this.state.termsPositions[
            this.getActualTermWithSufix()
          ].answered = true;

          if (this.state.vibrate) {
            Vibration.vibrate(100);
          }
        } else {
          if (this.state.vibrate) {
            Vibration.vibrate(500);
          }

          this.setState(previousState => {
            return {
              wrongTries: ++previousState.wrongTries
            };
          });
        }

        this.setState({ actualSufix: "" });
        this.setState({ actualTerm: "" });
        this.setState({ draggableVisible: false });
      }
    });

    this.panResponder2 = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        this.setState({ wordsSearchSelected: "" });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: this.state.pan.x, dy: this.state.pan.y }],
        {
          listener: (event, gestureState) => {
            let xPosition = Math.floor(
              (gestureState.moveX - this.state.gridStartPosition.x) / 19
            );
            let yPosition = Math.floor(
              (gestureState.moveY - this.state.gridStartPosition.y) / 25
            );

            if (
              typeof this.state.wordsSearchGameBoard[yPosition] !==
                "undefined" &&
              typeof this.state.wordsSearchGameBoard[yPosition][xPosition] !==
                "undefined"
            ) {
              if (
                !this.state.wordsSearchGameBoard[yPosition][xPosition].pressing
              ) {
                this.state.wordsSearchGameBoard[yPosition][
                  xPosition
                ].pressing = true;

                this.state.wordsSearchGameBoard[yPosition][
                  xPosition
                ].pressed = true;

                this.setState(previousState => {
                  return {
                    wordsSearchSelected: (previousState.wordsSearchSelected += this.state.wordsSearchGameBoard[
                      yPosition
                    ][xPosition].letter)
                  };
                });
              }
            }
          }
        }
      ),
      onPanResponderRelease: (e, gesture) => {
        if (
          this.state.wordsSearchGameWordToFind ===
          this.state.wordsSearchSelected
        ) {
          this.state.wordsSearchGame.find(i => {
            if (i.word === this.state.wordsSearchSelected) {
              i.answered = true;
            }
          });

          this.state.wordsSearchGameBoard.map(line => {
            line.map(column => {
              column.answered = column.answered || column.pressed;
            });
          });

          if (this.state.vibrate) {
            Vibration.vibrate(100);
          }

          if (
            this.state.wordsSearchGame.reduce((a, b) => {
              return a + (!b.answered ? 1 : 0);
            }, 0) === 0
          ) {
            let timeSpent = parseInt(
              (Math.abs(Date.now() - this.state.clock) / (1000 * 60)) % 60
            );

            this.setState({
              currentPoints: 100 + (timeSpent > 15 ? 0 : 150 - timeSpent * 10)
            });

            this.updateScreen("Points");
          } else {
            this.updateScreen("Game2Back");
          }
        } else {
          if (this.state.vibrate) {
            Vibration.vibrate(500);
          }
        }

        this.setState({ wordsSearchSelected: "" });

        this.updateGrid();
      }
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
      let vibrate = await AsyncStorage.getItem("@App:vibrate");

      this.setState({ signed: !(signed === null) });
      this.setState({ userName: userName === null ? "" : userName });
      this.setState({ userPicture: userPicture });
      this.setState({ vibrate: vibrate === null ? true : vibrate === "true" });
    } catch (error) {
      console.log(error);
    }
  };

  saveDBKey = async (key, value) => {
    await AsyncStorage.setItem("@App:" + key, value);
  };

  // Helper Functions

  actualThemeAnswered = () => {
    return !themes[this.state.actualTheme].paragraphs
      .map((p, i) => {
        return p.terms
          .map(t => {
            return typeof this.state.termsPositions[
              t + "_" + this.state.actualTheme + "_" + (i + 1)
            ] === "undefined"
              ? false
              : this.state.termsPositions[
                  t + "_" + this.state.actualTheme + "_" + (i + 1)
                ].answered;
          })
          .some(v => v === false);
      })
      .some(v => v === true);
  };

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
      case "Game1":
      case "Game1Again":
      case "Game2":
      case "Game2Back":
      case "Game3":
      case "Game3Answers":
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

  getActualTermWithSufix = () => {
    return this.state.actualTerm + this.state.actualSufix;
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
          <View key={"menu"} style={[styles.screen]}>
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
                onPress={() => {
                  this.updateScreen("Game1");
                }}
                style={[styles.button]}
              >
                <Text style={styles.textDefault}>Palavra Certa</Text>
              </Button>
              <Button
                block
                onPress={() => {
                  this.updateScreen("Game2");
                }}
                style={[styles.button, styles.marginTop25]}
              >
                <Text style={styles.textDefault}>Caçador de Palavras</Text>
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
              <View style={styles.contentMenuOptions}>
                <Button
                  rounded
                  onPress={() => {
                    this.toggleVibration();
                  }}
                  style={[
                    styles.buttonOval,
                    styles.marginTop25,
                    {
                      backgroundColor: this.state.vibrate
                        ? "#78CBF5"
                        : "#DFDFDF"
                    }
                  ]}
                >
                  <MaterialCommunityIcons
                    name="vibrate"
                    style={[styles.textDefault]}
                  />
                </Button>
                <Button
                  rounded
                  onPress={() => {
                    Alert.alert(
                      "Créditos",
                      "Idealização:\n- Geogenes Melo de Lima\n\nDesenvolvimento:\n- FL Studios\n- Fabiano Carneiro de Oliveira\n- Geogenes Melo de Lima\n\nContato:\n- fabiano.lothor@gmail.com\n- georgenesmelo@yahoo.com.br\n\n© 2018",
                      [{ text: "OK" }],
                      { cancelable: true }
                    );
                  }}
                  style={[styles.buttonOval, styles.marginTop25]}
                >
                  <MaterialCommunityIcons
                    name="information-variant"
                    style={[styles.textDefault]}
                  />
                </Button>
              </View>
            </View>
          </View>
        );
      case "Game1":
      case "Game1Again":
        return (
          <View style={styles.screen}>
            {this.state.draggableVisible ? (
              <Animated.View
                {...this.panResponder1.panHandlers}
                style={[
                  {
                    position: "absolute",
                    //transform: this.state.pan.getTranslateTransform(),
                    left: this.state.draggablePosition.x,
                    top: this.state.draggablePosition.y,
                    zIndex: 1
                  }
                ]}
              >
                <Badge style={styles.badgeSelected}>
                  <Text style={styles.badgeText}>{this.state.actualTerm}</Text>
                </Badge>
              </Animated.View>
            ) : null}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.textDefault}>
                  {this.state.actualParagraph === null
                    ? "Instruções"
                    : this.state.actualParagraph === 0
                    ? "Escolha um Tema"
                    : themes[this.state.actualTheme].name}
                </Text>
                <View style={styles.headerOptions}>
                  {this.state.actualParagraph > 0 ? (
                    <TouchableHighlight
                      style={styles.headerOption}
                      onPress={() => {
                        Alert.alert(
                          "Desistir",
                          "Tem certeza que deseja desistir do jogo e retornar para a tela de seleção de temas?\n\nSeu progresso será perdido.",
                          [
                            { text: "NÃO" },
                            {
                              text: "SIM",
                              onPress: () => {
                                this.updateScreen("Game1Again");
                              }
                            }
                          ],
                          { cancelable: true }
                        );
                      }}
                    >
                      <Entypo name="flag" style={[styles.textDefault]} />
                    </TouchableHighlight>
                  ) : null}
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
            </View>
            <View
              onLayout={e => {
                this.state.termLayoutAll["yContent"] = e.nativeEvent.layout.y;
              }}
              style={styles.contentFull}
            >
              {this.state.actualParagraph === 0 ? (
                <View style={styles.content}>
                  {themes.map((i, k) => {
                    return (
                      <Button
                        block
                        key={k}
                        onPress={() => {
                          this.setState({ actualTheme: k });
                          this.setState(previousState => {
                            return {
                              actualParagraph: ++previousState.actualParagraph
                            };
                          });

                          this.setState({ actualSufix: "" });
                          this.setState({ actualTerm: "" });
                          this.setState({ clock: Date.now() });
                          this.setState({ draggableVisible: false });
                          this.setState({ wrongTries: 0 });
                        }}
                        style={[
                          styles.button,
                          k > 0 ? styles.marginTop25 : null
                        ]}
                      >
                        <Text style={styles.textDefault}>{i.name}</Text>
                      </Button>
                    );
                  })}
                </View>
              ) : (
                <View>
                  <ScrollView
                    ref={scroller => {
                      this.scroller = scroller;
                    }}
                    onContentSizeChange={(w, h) => {
                      this.scroller.scrollTo({ x: 0, y: 0 });
                    }}
                    onLayout={e => {
                      this.state.termLayoutAll["width"] =
                        e.nativeEvent.layout.width;
                      this.state.termLayoutAll["y"] =
                        e.nativeEvent.layout.y + e.nativeEvent.layout.height;
                      this.state.termLayoutAll["yScroll"] =
                        e.nativeEvent.layout.y;
                      this.state.termLayoutAll["yScroller"] = 0;
                    }}
                    onScroll={e => {
                      this.state.termLayoutAll["yScroller"] =
                        e.nativeEvent.contentOffset.y;
                    }}
                    style={styles.contentScroll}
                  >
                    {this.state.actualParagraph === null ? (
                      <View style={styles.paragraphs}>
                        {this.splitPhrase("No jogo de aprendizagem ")}
                        <Text style={styles.textTerm}>palavra </Text>
                        <Text style={styles.textTerm}>certa</Text>
                        {this.splitPhrase(
                          ", você deve selecionar com um clique um dos termos disponíveis na parte inferior da tela e em seguida arrastá-lo para a sua posição correta. O jogo termina quando todos os parágrafos estiverem preenchidos."
                        )}
                        {this.splitPhrase(
                          "Ao final do preenchimento de cada tema, uma pontuação entre "
                        )}
                        <Text style={styles.textTerm}>100</Text>
                        <Text style={styles.textTerm}> e </Text>
                        <Text style={styles.textTerm}>500</Text>
                        {this.splitPhrase(" pontos será gerada.")}
                      </View>
                    ) : (
                      <View style={styles.paragraphs}>
                        {themes[this.state.actualTheme].paragraphs[
                          this.state.actualParagraph - 1
                        ].content.map((i, k) => {
                          return typeof themes[this.state.actualTheme]
                            .paragraphs[this.state.actualParagraph - 1].terms[
                            k
                          ] === "undefined"
                            ? this.splitPhrase(i)
                            : [
                                this.splitPhrase(i),
                                this.getTermText(
                                  themes[this.state.actualTheme].paragraphs[
                                    this.state.actualParagraph - 1
                                  ].terms[k],
                                  "_" +
                                    this.state.actualTheme +
                                    "_" +
                                    this.state.actualParagraph
                                )
                              ];
                        })}
                      </View>
                    )}
                  </ScrollView>
                  <ScrollView
                    horizontal
                    ref={scroller => {
                      this.scroller = scroller;
                    }}
                    onContentSizeChange={(w, h) => {
                      this.scroller.scrollTo({ x: 0, y: 0 });
                    }}
                    style={styles.contentScrollTerms}
                  >
                    {this.state.actualParagraph === null
                      ? this.state.instructionsTerms.map(i => {
                          return this.getTerm(i, "_instruções");
                        })
                      : this.state.termsOrder.map(i => {
                          return typeof themes[this.state.actualTheme]
                            .paragraphs[this.state.actualParagraph - 1].terms[
                            parseInt(i)
                          ] === "undefined"
                            ? null
                            : this.getTerm(
                                themes[this.state.actualTheme].paragraphs[
                                  this.state.actualParagraph - 1
                                ].terms[parseInt(i)],
                                "_" +
                                  this.state.actualTheme +
                                  "_" +
                                  this.state.actualParagraph
                              );
                        })}
                  </ScrollView>
                </View>
              )}
            </View>
            <View style={styles.footer}>
              {this.state.actualParagraph !== null &&
              this.state.actualParagraph !== 1 ? (
                <Button
                  block
                  onPress={() => {
                    this.setState(previousState => {
                      return {
                        actualParagraph:
                          previousState.actualParagraph === 0
                            ? null
                            : --previousState.actualParagraph
                      };
                    });

                    this.setState({ actualSufix: "" });
                    this.setState({ actualTerm: "" });
                    this.setState({ draggableVisible: false });
                  }}
                  style={[
                    styles.button,
                    this.state.actualParagraph > 0
                      ? styles.twoButtonsRight
                      : null
                  ]}
                >
                  <Ionicons name="ios-arrow-back" style={styles.textDefault} />
                  <Ionicons name="ios-arrow-back" style={styles.textDefault} />
                </Button>
              ) : null}
              {this.state.actualParagraph !== 0 ? (
                <Button
                  block
                  disabled={
                    this.state.actualTheme !== null &&
                    this.state.actualParagraph ===
                      themes[this.state.actualTheme].paragraphs.length &&
                    !this.actualThemeAnswered()
                  }
                  onPress={
                    this.state.actualParagraph === null
                      ? () => {
                          this.setState({ actualParagraph: 0 });
                          this.setState({ actualSufix: "" });
                          this.setState({ actualTerm: "" });
                          this.setState({ draggableVisible: false });
                        }
                      : this.state.actualTheme !== null &&
                        this.state.actualParagraph ===
                          themes[this.state.actualTheme].paragraphs.length
                      ? () => {
                          let timeSpent = parseInt(
                            (Math.abs(Date.now() - this.state.clock) /
                              (1000 * 60)) %
                              60
                          );

                          this.setState({
                            currentPoints:
                              100 +
                              (this.state.wrongTries <
                              themes[this.state.actualTheme].paragraphs
                                .map(p => {
                                  return p.terms.length;
                                })
                                .reduce((a, b) => a + b, 0)
                                ? (themes[this.state.actualTheme].paragraphs
                                    .map(p => {
                                      return p.terms.length;
                                    })
                                    .reduce((a, b) => a + b, 0) -
                                    this.state.wrongTries) *
                                  10
                                : 0) +
                              (timeSpent > 15 ? 0 : 150 - timeSpent * 10)
                          });

                          this.setState({
                            pointsOptionFunction: () => {
                              this.updateScreen("Game1Again");
                            }
                          });
                          this.setState({
                            pointsOptionLabel: "SELECIONAR OUTRO TEMA"
                          });

                          this.updateScreen("PointsWithOption");
                        }
                      : () => {
                          this.setState(previousState => {
                            return {
                              actualParagraph: ++previousState.actualParagraph
                            };
                          });

                          this.setState({ actualSufix: "" });
                          this.setState({ actualTerm: "" });
                          this.setState({ draggableVisible: false });
                        }
                  }
                  style={[
                    this.state.actualTheme !== null &&
                    this.state.actualParagraph ===
                      themes[this.state.actualTheme].paragraphs.length
                      ? this.actualThemeAnswered()
                        ? styles.button
                        : styles.buttonDisabled
                      : styles.button,
                    this.state.actualParagraph > 1
                      ? styles.twoButtonsLeft
                      : null
                  ]}
                >
                  {this.state.actualTheme !== null &&
                  this.state.actualParagraph ===
                    themes[this.state.actualTheme].paragraphs.length ? (
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
      case "Game2":
      case "Game2Back":
        return this.state.showGrid ? (
          <View style={styles.screen}>
            <Animated.View
              {...this.panResponder2.panHandlers}
              onLayout={e => {
                this.state.gridStartPosition = {
                  x: e.nativeEvent.layout.x,
                  y: e.nativeEvent.layout.y
                };
              }}
              style={[{ marginTop: 10 }]}
            >
              {this.state.wordsSearchGameBoard.map((line, key) => {
                return (
                  <View key={key} style={styles.gridLine}>
                    {line.map((cell, k) => {
                      return (
                        <Text
                          key={k}
                          style={[
                            styles.gridText,
                            cell.pressed && cell.pressing
                              ? styles.gridTextPressed
                              : cell.answered
                              ? styles.gridTextAnswered
                              : null
                          ]}
                        >
                          {cell.letter.toUpperCase()}
                        </Text>
                      );
                    })}
                  </View>
                );
              })}
            </Animated.View>
            <View style={styles.footerGrid}>
              <Button
                block
                onPress={() => {
                  this.updateScreen("Game2Back");
                }}
                style={styles.buttonGrid}
              >
                <Text style={styles.textDefault}>
                  {this.state.wordsSearchSelected === ""
                    ? "VOLTAR"
                    : this.state.wordsSearchSelected.toUpperCase()}
                </Text>
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.screen}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.textDefault}>
                  {this.state.showInstructions
                    ? "Instruções"
                    : "Caçador de Palavras"}
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
                onContentSizeChange={(w, h) => {
                  this.scroller.scrollTo({ x: 0, y: 0 });
                }}
                style={styles.contentScroll}
              >
                {this.state.showInstructions ? (
                  <View style={styles.paragraphs}>
                    {this.splitPhrase("No jogo de aprendizagem ")}
                    <Text style={styles.textTerm}>caçador</Text>
                    <Text style={styles.textTerm}> de </Text>
                    <Text style={styles.textTerm}>palavras</Text>
                    {this.splitPhrase(
                      ", você deve selecionar uma pergunta e encontrar sua resposta inserida no quadro de palavras disponível."
                    )}
                    {this.splitPhrase("Uma pontuação entre ")}
                    <Text style={styles.textTerm}>100</Text>
                    <Text style={styles.textTerm}> e </Text>
                    <Text style={styles.textTerm}>250</Text>
                    {this.splitPhrase(
                      " pontos será gerada, quando todas as perguntas forem respondidas."
                    )}
                  </View>
                ) : (
                  this.state.wordsSearchGame.map((i, k) => {
                    return (
                      <ListItem key={k}>
                        <Body
                          style={[
                            {
                              flexDirection: "row",
                              justifyContent: "space-between"
                            }
                          ]}
                        >
                          <Text style={[{ width: "75%" }]}>{i.label}</Text>
                          <Button
                            disabled={i.answered}
                            onPress={() => {
                              Expo.ScreenOrientation.allow(
                                Expo.ScreenOrientation.Orientation.LANDSCAPE
                              );

                              this.setState({ showGrid: true });
                              this.setState({
                                wordsSearchGameWordToFind: i.word
                              });
                            }}
                            style={[
                              !i.answered ? styles.button : null,
                              styles.buttonWordsSearchGame
                            ]}
                          >
                            {i.answered ? (
                              <Ionicons
                                name="md-done-all"
                                style={styles.textDefault}
                              />
                            ) : (
                              <MaterialCommunityIcons
                                name="textbox-password"
                                style={styles.textDefault}
                              />
                            )}
                          </Button>
                        </Body>
                      </ListItem>
                    );
                  })
                )}
              </ScrollView>
            </View>
            {this.state.showInstructions ? (
              <View style={styles.footer}>
                <Button
                  block
                  onPress={() => {
                    this.setState({ showInstructions: false });
                  }}
                  style={styles.button}
                >
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
                </Button>
              </View>
            ) : null}
          </View>
        );
      case "Game3":
      case "Game3Answers":
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
                onContentSizeChange={(w, h) => {
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
                        this.state.actualQuestion === 0 ||
                        this.state.screen === "Game3Answers"
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
                          (i.correct &&
                            (this.state.actualQuestion === 0 ||
                              this.state.screen === "Game3Answers")) ||
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
                            : this.state.screen === "Game3Answers" && i.correct
                            ? "#136F35"
                            : this.state.screen === "Game3Answers" &&
                              typeof this.state.answers[
                                this.state.questionOrder[
                                  this.state.actualQuestion - 1
                                ]
                              ] !== "undefined" &&
                              this.state.answers[
                                this.state.questionOrder[
                                  this.state.actualQuestion - 1
                                ]
                              ] ===
                                i.id - 1
                            ? "#FF0000"
                            : this.state.screen === "Game3Answers"
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
              {(this.state.screen !== "Game3Answers" &&
                this.state.actualQuestion > 0 &&
                this.state.actualQuestion < questions.length) ||
              (this.state.screen === "Game3Answers" &&
                this.state.actualQuestion > 1 &&
                this.state.actualQuestion < questions.length) ? (
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

                          this.setState({
                            pointsOptionFunction: () => {
                              this.updateScreen("Game3Answers");
                            }
                          });
                          this.setState({
                            pointsOptionLabel: "REVISAR RESPOSTAS"
                          });

                          this.updateScreen("PointsWithOption");
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
                    (this.state.screen === "Game3Answers" &&
                      this.state.actualQuestion > 1) ||
                    (this.state.screen !== "Game3Answers" &&
                      this.state.actualQuestion > 0)
                      ? styles.twoButtonsLeft
                      : null
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
      case "PointsWithOption":
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
            <View
              style={
                this.state.screen === "PointsWithOption"
                  ? styles.pointsWithOption
                  : styles.points
              }
            >
              <Text style={styles.textPoints}>{this.state.currentPoints}</Text>
            </View>
            {this.state.screen === "PointsWithOption" ? (
              <Button
                block
                onPress={this.state.pointsOptionFunction}
                style={[styles.button]}
              >
                <Text style={styles.textDefault}>
                  {this.state.pointsOptionLabel}
                </Text>
              </Button>
            ) : null}
            <Button
              block
              onPress={() => {
                this.updateScreen("Menu");
              }}
              style={[
                styles.button,
                this.state.screen === "PointsWithOption"
                  ? styles.marginTop10
                  : null
              ]}
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

  getTerm = (term, sufix = "") => {
    return this.state.actualTerm !== term &&
      !this.termAnswered(term + sufix) ? (
      <TouchableWithoutFeedback
        key={term + sufix}
        onLayout={e => {
          this.state.termLayout[term + sufix] = {
            width: e.nativeEvent.layout.width
          };
        }}
        onPress={e => {
          this.selectTerm(term, sufix);
        }}
        onLongPress={e => {
          this.selectTerm(term, sufix);
        }}
      >
        <Badge style={styles.badge}>
          <Text style={styles.badgeText}>{term}</Text>
        </Badge>
      </TouchableWithoutFeedback>
    ) : null;
  };

  getTermText = (term, sufix = "") => {
    return !this.termAnswered(term, sufix) ? (
      <Text
        key={term + sufix}
        onLayout={e => {
          this.state.termsPositions[term + sufix] = {
            answered: this.termAnswered(term, sufix),
            height: e.nativeEvent.layout.height,
            width: e.nativeEvent.layout.width,
            x: e.nativeEvent.layout.x,
            y: e.nativeEvent.layout.y
          };
        }}
        style={styles.textTerm}
      >
        {sufix === "_instruções" ? "_ _ _ _ _ _ _" : "_ _ _ _ _ _ _ _ _ _"
        //term.replace(/./g, blankSpaces)
        }
      </Text>
    ) : (
      this.splitPhrase(term, true)
    );
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

  selectTerm = (term, sufix = "") => {
    if (this.state.vibrate) {
      Vibration.vibrate(100);
    }

    this.setState({
      draggablePosition: {
        x:
          this.state.termLayoutAll.width / 2 -
          this.state.termLayout[term + sufix].width / 2,
        y: this.state.termLayoutAll.y + 50
      }
    });

    this.setState({ actualSufix: sufix });
    this.setState({ actualTerm: term });
    this.setState({ draggableVisible: true });
  };

  splitPhrase = (phrase, isTerm = false) => {
    let words = phrase.split(" ");
    return words.map((i, k) => {
      return (
        <Text key={k} style={isTerm ? styles.textTerm : styles.textParagraph}>
          {i}
        </Text>
      );
    });
  };

  termAnswered = (term, sufix = "") => {
    return typeof this.state.termsPositions[term + sufix] === "undefined"
      ? false
      : this.state.termsPositions[term + sufix].answered;
  };

  ticker = () => {
    setTimeout(() => {
      if (this.state.fontLoaded) {
        if (this.state.timer === splashTimer) {
          this.updateScreen("Start");
          //this.updateScreen("Menu");
        }

        this.setState(previousState => {
          return { timer: ++previousState.timer };
        });
      }

      this.ticker();
    }, 1000);
  };

  toggleVibration = () => {
    this.setState(previousState => {
      return {
        vibrate: !previousState.vibrate
      };
    });

    this.saveDBKey("vibrate", !this.state.vibrate ? "true" : "false");

    if (!this.state.vibrate) {
      Vibration.vibrate(500);
    }
  };

  updateGrid = (populate = false) => {
    if (populate) {
      this.setState({ clock: Date.now() });

      wordsSearchGame.map(i => {
        i.answered = false;
      });

      /*
      this.setState({
        wordsSearchGame: wordsSearchGame.sort((i, j) => {
          return i.word.length <= j.word.length ? 1 : -1;
        })
      });
      //*/
      //*
      this.setState({
        wordsSearchGame: wordsSearchGame.sort(() => Math.random() - 0.5)
      });
      //*/

      for (let w = 0; w < this.state.wordsSearchGame.length; ++w) {
        let word = this.state.wordsSearchGame[w].word;
        let vertical =
          word.length < maxLinesGrid - 2 && Math.round(Math.random()) > 0;

        let maxStart = (vertical ? maxLinesGrid : maxColumnsGrid) - word.length;
        let start = Math.floor(Math.random() * (maxStart + 1));
        let startLine = vertical
          ? start
          : Math.floor(Math.random() * maxLinesGrid);
        let startColumn = vertical
          ? Math.floor(Math.random() * maxColumnsGrid)
          : start;

        let canAdd = true;

        for (let l = 0; canAdd && l < word.length; ++l) {
          let line = startLine + (vertical ? l : 0);
          let column = startColumn + (vertical ? 0 : l);

          if (
            this.state.wordsSearchGameBoard[line][column] !== null &&
            this.state.wordsSearchGameBoard[line][column].letter !== word[l]
          ) {
            canAdd = false;
          }
        }

        if (canAdd) {
          for (let l = 0; l < word.length; ++l) {
            let line = startLine + (vertical ? l : 0);
            let column = startColumn + (vertical ? 0 : l);

            this.state.wordsSearchGameBoard[line][column] = {
              answered: this.state.wordsSearchGame[w].answered,
              letter: word[l],
              pressed: this.state.wordsSearchGame[w].answered,
              pressing: false
            };
          }
        } else {
          --w;
        }
      }
    }

    for (let i = 0; i < this.state.wordsSearchGameBoard.length; ++i) {
      for (let j = 0; j < this.state.wordsSearchGameBoard[i].length; ++j) {
        if (this.state.wordsSearchGameBoard[i][j] === null) {
          this.state.wordsSearchGameBoard[i][j] = {
            letter: Math.random()
              .toString(36)
              .replace(/[^a-z]+/g, "")
              .substr(0, 1),
            pressed: false,
            pressing: false
          };
        }

        this.state.wordsSearchGameBoard[i][
          j
        ].pressed = this.state.wordsSearchGameBoard[i][j].answered;
        this.state.wordsSearchGameBoard[i][j].pressing = false;
      }
    }
  };

  updateScreen = screenName => {
    let beforeScreen = this.state.screen;

    this.setState({ screen: screenName });
    this.setState({ animationStar: null });

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
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.ALL);

        this.loadDBKeys();

        this.setState({
          wordsSearchGameBoard: Array(maxLinesGrid)
            .fill()
            .map(() => Array(maxColumnsGrid).fill(null))
        });
        break;
      case "Game1":
      case "Game1Again":
        this.setState({
          actualParagraph: screenName === "Game1Again" ? 0 : null
        });
        this.setState({ actualSufix: "" });
        this.setState({ actualTerm: "" });
        this.setState({ actualTheme: null });
        this.setState({ clock: Date.now() });
        this.setState({ currentPoints: 0 });
        this.setState({ draggableVisible: false });
        this.setState({
          termsPositions: this.state.instructionsTerms.sort(
            () => Math.random() - 0.5
          )
        });
        this.setState({ termLayout: {} });
        this.setState({ termLayoutAll: {} });
        this.setState(previousState => {
          return {
            termsOrder: previousState.termsOrder.sort(() => Math.random() - 0.5)
          };
        });
        this.setState({ termsPositions: {} });
        this.setState({ wrongTries: 0 });
        break;
      case "Game2":
      case "Game2Back":
        Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.ALL);

        this.setState({ showGrid: false });
        this.setState({
          showInstructions: screenName === "Game2Back" ? false : true
        });
        this.setState({ wordsSearchGameWordToFind: "" });

        this.updateGrid(screenName === "Game2");
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
      case "Game3Answers":
        this.setState({ actualQuestion: 1 });
      case "Points":
      case "PointsWithOption":
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
    height: 250,
    transform: [{ scale: 5 }],
    width: 200
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
  badge: {
    backgroundColor: "#FA7447",
    margin: 5
  },
  badgeSelected: {
    backgroundColor: "#000000",
    margin: 5
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 16,
    padding: 2,
    fontWeight: "bold"
  },
  breakLine: {
    marginTop: "1%",
    marginBottom: "1%"
  },
  button: {
    backgroundColor: "#78CBF5",
    height: 50
  },
  buttonOval: {
    backgroundColor: "#78CBF5",
    justifyContent: "center",
    minHeight: 50,
    minWidth: 50
  },
  buttonDisabled: {
    height: 50,
    width: "100%"
  },
  buttonGrid: {
    backgroundColor: "#78CBF5",
    height: 40
  },
  buttonWordsSearchGame: {
    paddingLeft: 10,
    paddingRight: 10
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
  contentMenuOptions: {
    alignItems: "center",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%"
  },
  contentQuestions: {
    marginBottom: "2%"
  },
  contentScroll: {
    marginTop: "2%",
    marginBottom: "2%",
    height: "100%",
    minWidth: "100%",
    paddingLeft: "4%",
    paddingRight: "4%"
  },
  contentScrollTerms: {
    marginBottom: "2%",
    minHeight: 35,
    minWidth: "100%"
  },
  footer: {
    alignItems: "center",
    flexWrap: "wrap",
    flexDirection: "column",
    height: 60,
    width: "90%"
  },
  footerGrid: {
    alignItems: "center",
    flexWrap: "wrap",
    flexDirection: "column",
    height: 40,
    width: "100%"
  },
  gridLine: {
    flexDirection: "row"
  },
  gridText: {
    borderColor: "#000000",
    borderWidth: 0.25,
    fontSize: 18,
    height: 25,
    textAlign: "center",
    width: 19
  },
  gridTextAnswered: {
    backgroundColor: "#FCB9A3",
    fontWeight: "bold"
  },
  gridTextPressed: {
    backgroundColor: "#FA7447",
    color: "#FFFFFF",
    fontWeight: "bold"
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
    justifyContent: "center",
    marginLeft: 15
  },
  headerOptions: {
    alignItems: "flex-end",
    flexDirection: "row",
    height: "100%",
    justifyContent: "space-between"
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
  marginTop10: {
    marginTop: 10
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
  paragraphs: {
    flexDirection: "row",
    flexWrap: "wrap",
    minWidth: "100%"
  },
  points: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 50,
    position: "absolute"
  },
  pointsWithOption: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 115,
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
  textItalic: {
    fontSize: 18,
    fontStyle: "italic"
  },
  textPoints: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "bold"
  },
  textParagraph: {
    fontSize: 20,
    marginLeft: 2,
    marginRight: 2
  },
  textQuestion: {
    fontSize: 18
  },
  textStrong: {
    fontSize: 18,
    fontWeight: "bold"
  },
  textTerm: {
    color: "#FA7447",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 2,
    marginRight: 2
  },
  twoButtonsLeft: {
    marginLeft: "5%",
    width: "45%"
  },
  twoButtonsRight: {
    marginRight: "5%",
    width: "45%"
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

// Questions

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
        </Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textQuestion}>
          Ao final do jogo, uma pontuação entre{" "}
          <Text style={[styles.textQuestion, styles.textTerm]}>0 e 100</Text>{" "}
          pontos será gerada quando todas as perguntas forem respondidas.
        </Text>
        <Text style={styles.breakLine} />
        <Text style={styles.textStrong}>Ex: Quem descobriu o Brasil?</Text>
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
        A respeito da velocidade da luz e sua natureza. Assine a alternativa
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
        Acerca do propósito e dos resultados obtidos pelo Experimento de
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
          <Text style={styles.textItalic}>
            {" "}
            70km&frasl;h, 100km&frasl;h, 0,1c{" "}
          </Text>
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
          <Text style={styles.textItalic}>
            {" "}
            30km&frasl;h (100km&frasl;h – 70km&frasl;h)
          </Text>
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
          <Text style={styles.textItalic}> 100km&frasl;h</Text>
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

// Themes

const themes = [
  {
    name: "Luz e Interferômetro",
    paragraphs: [
      {
        content: [
          "Seja no campo da filosofia ou no científico-experimental, o conceito e a natureza da luz inquietam o homem. Galileu (1564-1642) físico",
          ", que viveu entre os séculos XVI e XVII, propôs um experimento conhecido como",
          ", o objetivo era observar se a velocidade da luz era instantânea ou não, assim verificar se a luz tinha velocidade",
          "ou",
          ". Todavia não há relatos acerca de qual resultado obteve, nem a veracidade desse experimento, é fato que Galileu entendia ter a luz uma velocidade muito",
          ", comparada à velocidade do som vinda com os trovões durante uma tempestade."
        ],
        terms: [
          "italiano",
          "“experimento das lanternas”",
          "finita",
          "infinita",
          "elevada"
        ]
      },
      {
        content: [
          "Newton (1642-1727) físico",
          ", acreditava que a velocidade da luz era",
          "e variava sua intensidade de acordo com o meio de propagação, semelhante à variação da velocidade do som, ou seja, em um meio mais denso como a água por exemplo, a luz tinha velocidade",
          ", que aquela apresentada no o ar. Fermat (1601-1665) advogado e matemático",
          ", afirmava o oposto. – A velocidade da luz é",
          "na água quando comparada à velocidade no ar. Dizia ele."
        ],
        terms: ["inglês", "finita", "maior", "francês", "menor"]
      },
      {
        content: [
          "Newton também divergia de outros físicos, quanto a natureza da luz. Para Newton, a luz tinha natureza",
          ", enquanto para Huygens (1629-1695) físico e matemático",
          ", a luz tinha comportamento",
          ". Atualmente é consenso que a luz tem comportamento",
          ", ora de onda, ora de partícula é a conhecida dualidade",
          "."
        ],
        terms: [
          "corpuscular",
          "holandês",
          "ondulatório",
          "dual",
          "onda-partícula"
        ]
      },
      {
        content: [
          "Em 1887 o",
          "de Michelson, mais sensível e estável que o da primeira versão de 1880, comprovou de forma irrefutável a não existência do",
          "e várias consequências vieram com essa comprovação, a mais importante foi a constância da velocidade da",
          ". A ",
          "do comprimento de Fitzgerald (1851-1901), foi uma tentativa de explicar os resultados negativos do experimento de",
          "a fim de garantir a",
          "do éter. Uma vez constante a velocidade da luz no vácuo para qualquer",
          ", a relatividade Galileana apresentava",
          ", sendo necessário a criação de uma nova",
          "que enquadrasse todos as consequências da constância de c."
        ],
        terms: [
          "interferômetro",
          "éter",
          "luz",
          "contração",
          "Michelson e Morley",
          "existência",
          "referencial inercial",
          "falhas",
          "teoria da relatividade"
        ]
      }
    ]
  },
  {
    name: "Os Postulados da TRE",
    paragraphs: [
      {
        content: [
          "Einstein (1879-1955) físico",
          ", publica em 1905 o seu mais conhecido trabalho, nascera ali a teoria que revolucionaria o conceito de espaço e tempo que se tinha até então. A",
          "(TRE) se apoia em dois postulados, o primeiro afirma que as “leis da física são as mesmas em qualquer sistema de referência ",
          "” e o segundo “A velocidade c da luz no vácuo, é sempre a",
          "em qualquer sistema de referência inercial e não depende da velocidade da fonte”, esse segundo é conhecido como o princípio da",
          "da velocidade da luz."
        ],
        terms: [
          "alemão",
          "Teoria da Relatividade Especial",
          "inercial",
          "mesma",
          "constância"
        ]
      },
      {
        content: [
          "Um fato curioso, consequência dos desdobramentos dos postulados da TER, é o da “relatividade da simultaneidade”, segundo esse princípio: Se dois eventos ocorrem em um mesmo instante num dado",
          ", dizemos que eles são",
          "nesse referencial. Todavia, esses mesmos eventos",
          "necessariamente simultâneos em outros referenciais, em outras palavras, o tempo é uma quantidade",
          "e não",
          "como se pensava Newton. Com a ideia de tempo relativo, surge uma nova definição ligada a esse fato, o de tempo próprio, que é aquele intervalo de tempo medido pelo relógio pertencente ao",
          "onde ocorre o evento, essa relatividade temporal é conhecida como",
          "."
        ],
        terms: [
          "referencial",
          "simultâneos",
          "não serão",
          "relativa",
          "absoluta",
          "mesmo referencial",
          "dilatação do tempo"
        ]
      },
      {
        content: [
          "Há também a",
          "do comprimento. O comprimento de uma barra quando medido no referencial em relação ao qual a barra está em movimento é",
          "do que o comprimento medido no referencial ao qual a barra está em repouso. E o mais surpreendente, essa distinção entre essas medidas só ocorre se as mesmas forem feitas na",
          ". O comprimento medido no referencial de repouso da barra, é chamado de",
          ". A conexão entre tempo próprio (t₀) e o tempo dilatado (t) é estabelecida através do fator de",
          "(γ), de modo que, o tempo próprio é igual ao tempo dilatado",
          "pelo fator γ. Já o comprimento próprio (L₀) é igual ao comprimento contraído (L)",
          "pelo fator γ."
        ],
        terms: [
          "contração",
          "menor",
          "direção do movimento",
          "comprimento próprio",
          "Lorentz",
          "dividido",
          "multiplicado"
        ]
      }
    ]
  }
];

// Word Search

const wordsSearchGame = [
  {
    answered: false,
    label: "A velocidade da luz é uma quantidade:",
    word: "absoluta"
  },
  {
    answered: false,
    label:
      "Tipo de publicação usada por Einstein para apresentar seus trabalhos em 1905:",
    word: "artigo"
  },
  {
    answered: false,
    label:
      "O comprimento medido em relação ao qual um objeto está em movimento:",
    word: "contraído"
  },
  {
    answered: false,
    label: "Natureza da luz defendida por Newton:",
    word: "corpuscular"
  },
  { answered: false, label: "Número de postulados da TER:", word: "dois" },
  {
    answered: false,
    label: "Natureza da luz aceita atualmente:",
    word: "dual"
  },
  {
    answered: false,
    label: "Criador da teoria moderna da relatividade:",
    word: "einstein"
  },
  {
    answered: false,
    label: "Meio material ao qual se acreditava suportar ondas de luz:",
    word: "éter"
  },
  {
    answered: false,
    label:
      "Físico que sugeriu a contração do comprimento em um dos braços do interferômetro:",
    word: "fitzgerald"
  },
  {
    answered: false,
    label: "Nome do paradoxo usado para ilustrar a relatividade do tempo:",
    word: "gêmeos"
  },
  {
    answered: false,
    label: "Tipos de referências aos quais são válidos a TRE:",
    word: "inerciais"
  },
  {
    answered: false,
    label:
      "Aparelho criado por Michelson para verificar a velocidade da luz relativo ao éter:",
    word: "interferômetro"
  },
  {
    answered: false,
    label:
      "Instrumento usado por Galileu na tentativa de medir a velocidade da luz:",
    word: "lanterna"
  },
  {
    answered: false,
    label: "Sigla para o tipo de movimento entre referenciais inerciais:",
    word: "mru"
  },
  {
    answered: false,
    label: "Natureza da luz defendida por Huygens:",
    word: "ondulatória"
  },
  {
    answered: false,
    label:
      "O intervalo de tempo medido no referencial no qual ocorre os eventos:",
    word: "próprio"
  },
  {
    answered: false,
    label:
      "A relatividade da simultaneidade estabelece o tempo com uma quantidade:",
    word: "relativística"
  },
  {
    answered: false,
    label: "Parâmetro que altera o valor do fator de Lorentz:",
    word: "velocidade"
  },
  {
    answered: false,
    label: "A relatividade de Galileu falha em altas:",
    word: "velocidades"
  }
];
