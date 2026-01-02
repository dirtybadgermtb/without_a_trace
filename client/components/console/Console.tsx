import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./Console.scss";
import { Weapon } from "./Weapon";
import { Suspect } from "./Suspect";
import { Room } from "./Room";
import { ApiClient } from "../../ApiClient";
import { DemoApiClient, DEMO_MODE } from "../../DemoApiClient";
import { unprettifyName } from "../../utils/CharacterNameHelper";

// Use demo or real API based on DEMO_MODE
const Api = DEMO_MODE ? DemoApiClient : ApiClient;

export const Console = (props) => {
  const [player, setPlayer] = useState<string>("");
  const [character, setCharacter] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [weapon, setWeapon] = useState<string>("");
  const [room, setRoom] = useState<string>(Room.empty);
  const [suspect, setSuspect] = useState<string>("");
  const [readyToSuggestOrAccuse, setReadyToSuggestOrAccuse] =
    useState<boolean>(false);

  let outputMessage = "";

  useEffect(() => {
    setPlayer(props.player);
    setCharacter(props.character);
    getUpdatedPlayer(props.player);
  });

  useEffect(() => {
    if (player !== "") {
      props.socket.on("client-to-client", function (toPlayer, msg) {
        if (toPlayer === player) {
          updateOutputMessage(msg);
        }
      });
      props.socket.on("message", function (msg) {
        updateOutputMessage(msg);
      });

      props.socket.on("start", function (msg) {
        updateOutputMessage(msg);
      });

      props.socket.on("player-move", function (msg) {
        updateOutputMessage(msg);
      });

      props.socket.on("disapprove", function (msg, a) {
        updateOutputMessage(msg);
      });

      props.socket.on("whatever", function (msg, a) {
        updateOutputMessage(msg);
      });

      props.socket.on("new-player", function (newPlayer) {
        updateOutputMessage(newPlayer);
      });

      props.socket.on("current-player", async (tag) => {
        updateOutputMessage("It's " + tag + " turn!");
      });
    }
  }, [player]);

  const getUpdatedPlayer = async (playerName) => {
    if (playerName) {
      try {
        const response = await Api.get("/player/" + playerName);
        const roomHall = response.room_hall;
        if (Room[roomHall]) {
          setRoom(Room[roomHall]);
        }
        setReadyToSuggestOrAccuse(response.allow_suggestion || DEMO_MODE);
      } catch (error) {
        // In demo mode, enable suggestions by default
        if (DEMO_MODE) {
          setReadyToSuggestOrAccuse(true);
        }
      }
    }
  };

  const getCurrentTime = () => {
    return (
      new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }) + " "
    );
  };

  const updateOutputMessage = (msg: string) => {
    outputMessage = outputMessage.concat(getCurrentTime() + msg) + "\r\n\r\n";
    setOutput(outputMessage);
    var textarea = document.getElementById("console_output");
    textarea!.scrollTop = textarea!.scrollHeight;
  };

  const handleSuspectChange = (selectedOption) => {
    setSuspect(selectedOption.label);
  };

  const handleRoomChange = (selectedOption) => {
    setRoom(selectedOption.label);
  };

  const handleWeaponChange = (selectedOption) => {
    setWeapon(selectedOption.label);
  };

  const accuse = async () => {
    const message =
      suspect + " is the murderer in the " + room + " room using a " + weapon;
    props.socket.emit(
      "channel-accusation",
      player + " (" + Suspect[character] + ")",
      message
    );
    const payload = {
      accused_character: unprettifyName(suspect),
      accused_weapon: weapon.toLowerCase(),
      accused_room: room.toLowerCase(),
    };
    const response = await Api.put(
      "/player/accusation/" + player,
      payload
    );
    if (response.error === undefined) {
      props.socket.emit(
        "channel-whatever",
        player + (response.guess ? " WINS!" : " LOSES!")
      );
      props.socket.emit(
        "channel-current-player",
        response.current_player_info.player_name,
        response.current_player_info.character_name,
        Suspect[response.current_player_info.character_name]
      );
    }
  };

  const suggest = async () => {
    const message =
      suspect + " is the murderer in the " + room + " room using a " + weapon;
    props.socket.emit(
      "channel-suggestion",
      player,
      player + " (" + Suspect[character] + ")",
      message
    );
    const payload = {
      suggested_character: unprettifyName(suspect),
      suggested_weapon: weapon,
      suggested_room: room,
    };
    const response = await Api.put(
      "/player/suggestions/" + player,
      payload
    );
    if (response.error === undefined) {
      props.socket.emit(
        "channel-player-move-only",
        suspect + " has been moved to " + room + " by " + Suspect[character]
      );
      props.socket.emit(
        "channel-current-player",
        response.current_player_info.player_name,
        response.current_player_info.character_name,
        Suspect[response.current_player_info.character_name]
      );
      props.socket.emit(
        "channel-disapprove",
        response.current_player_info.player_name +
          ", if applicable, please click on a card to disapprove or click on the empty card to go on the next player",
        response.current_player_info
      );
    }
  };

  const weapons = Object.keys(Weapon).filter((item) => {
    return isNaN(Number(item));
  });

  const suspects = () => {
    return Object.keys(Suspect).filter((item) => {
      return isNaN(Number(item));
    });
  };

  const rooms = Object.keys(Room).filter((item) => {
    return isNaN(Number(item));
  });

  const customStyle = {
    container: (styles) => ({ ...styles, width: "40%" }),
  };

  return (
    <div className="console-container">
      <p className="title">Console</p>
      <div className="block">
        <label>Suspects:</label>
        <Select
          placeholder="Select a suspect.."
          styles={customStyle}
          options={suspects().map((v) => ({
            label: Suspect[v],
            value: v,
          }))}
          onChange={handleSuspectChange}
        />
      </div>
      <div className="block">
        <label>Rooms:</label>
        <Select
          placeholder={room}
          styles={customStyle}
          options={rooms.map((v) => ({
            label: Room[v],
            value: v,
          }))}
          onChange={handleRoomChange}
        />
      </div>
      <div className="block">
        <label>Weapons:</label>
        <Select
          placeholder="Select a weapon.."
          styles={customStyle}
          options={weapons.map((v) => ({
            label: Weapon[v],
            value: v,
          }))}
          onChange={handleWeaponChange}
        />
      </div>
      <div className={"announce " + (!readyToSuggestOrAccuse ? "disable" : "")}>
        <button
          className={"suggest " + (!readyToSuggestOrAccuse ? "disable" : "")}
          onClick={suggest}
          disabled={!readyToSuggestOrAccuse}
        >
          Suggest
        </button>
        <button className="accuse" onClick={accuse}>
          Accuse
        </button>
      </div>
      <div className="output">
        <label>Output</label>
        <textarea id="console_output" value={output} readOnly />
      </div>
    </div>
  );
};
