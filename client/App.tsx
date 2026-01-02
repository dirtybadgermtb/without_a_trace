import * as React from "react";
import "./App.scss";
import Notes from "./components/note/Notes";
import { Board } from "./components/board/Board";
import { Modal } from "./components/modal/Modal";
import { Console } from "./components/console/Console";
import { Cards } from "./components/card/Cards";
import { ApiClient } from "./ApiClient";
import { DemoApiClient, DemoSocketIO, DEMO_MODE } from "./DemoApiClient";
import { Suspect } from "./components/console/Suspect";

// Use demo or real API based on DEMO_MODE
const Api = DEMO_MODE ? DemoApiClient : ApiClient;

interface AppProps {}

interface AppState {
  disable: boolean;
  player: string;
  character: string;
  isPlaying: boolean;
  currentPlayerHeader: string;
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      disable: true,
      player: "",
      character: "",
      isPlaying: false,
      currentPlayerHeader: "",
    };
    this.socket = DEMO_MODE
      ? DemoSocketIO.connect("demo", {})
      : this.io.connect("http://localhost:3001", { reconnect: true });
  }

  componentDidMount() {
    this.setIsPlaying();

    this.socket.on("start", async (msg) => {
      const response = await ApiClient.get("/player/" + this.state.player);
      console.log(msg);
      this.setPlayerDeck(response);
      this.enableGame();
    });

    this.socket.on("current-player", async (msg) => {
      this.setState({
        currentPlayerHeader: msg,
      });
    });
  }

  private socket;
  private io = require("socket.io-client");

  playerCards = new Map();

  enableGame = () => this.setState({ disable: false });

  setPlayerName = (player, character) => {
    this.setState({ player: player, character: character });
    this.socket.emit("channel-new-player", player);
  };

  setIsPlaying = async () => {
    try {
      const flag = await Api.get("/start");
      this.setState({ isPlaying: flag.isPlaying });
    } catch (error) {
      console.log("[Demo mode] Could not reach backend, continuing...");
      this.setState({ isPlaying: false });
    }
  };

  handleStartButton = async () => {
    const { player } = this.state;
    try {
      const response = await Api.post("/start");
      const current_player = response["current_player"];
      const current_character = response[current_player].character_name;
      this.socket.emit("channel-start", player);
      this.socket.emit(
        "channel-current-player",
        current_player,
        current_character,
        Suspect[current_character]
      );
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  handleDisapproval = async (card, suggestedPlayer) => {
    const payload = {
      card: this.playerCards.get(card),
    };
    const response = await Api.put("/player/disprove", payload);
    this.socket.emit(
      "channel-client-to-client",
      suggestedPlayer + " picks the " + this.playerCards.get(card) + " card"
    );
    this.socket.emit(
      "channel-current-player",
      response.current_player_info.player_name,
      response.current_player_info.character_name,
      Suspect[response.current_player_info.character_name]
    );
    if (this.playerCards.get(card) === "empty") {
      this.socket.emit(
        "channel-disapprove",
        response.current_player_info.player_name +
          ", if applicable, please click on a card to disapprove or click on the empty card to go on the next player",
        response.current_player_info
      );
    }
  };

  handleReset = async () => {
    const response = await Api.post("/reset");
    if (response.reset) {
      this.setState({ isPlaying: false });
    }
  };

  setPlayerDeck = (response) => {
    response.cards.map((c: string) =>
      this.playerCards.set(require("./assets/" + c + ".jpg"), c)
    );
    this.playerCards.set(require("./assets/empty.jpg"), "empty");
  };

  render() {
    const { disable, player, character, isPlaying, currentPlayerHeader } =
      this.state;
    if (!isPlaying) {
      return (
        <>
          <Modal handleCallback={this.setPlayerName} />
          {disable && (
            <button className="start-game" onClick={this.handleStartButton}>
              START!
            </button>
          )}
          {!disable && (
            <button className="current-player">
              {currentPlayerHeader} Turn
            </button>
          )}
          <div className={`app ${disable && "disable"}`}>
            <Board socket={this.socket} player={player} character={character} />
            <div className="section">
              <Cards
                set={Array.from(this.playerCards.keys())}
                socket={this.socket}
                player={player}
                cardClick={this.handleDisapproval}
              />
              <div className="section-child">
                <Console
                  player={player}
                  character={character}
                  socket={this.socket}
                  io={this.io}
                />
                <Notes />
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <p className="already-playing">
            THE GAME IS ALREADY PLAYING! PLEASE WAIT FOR THE NEXT GAME. <br />
            To reset the game, please click on the following button.
          </p>
          <button onClick={this.handleReset}>RESET</button>
        </>
      );
    }
  }
}
