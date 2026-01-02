import * as React from "react";
import { Room, Empty } from "./Room";
import { Hall } from "./Hall";
// USS Vesper Room Images
import DATA_CORE from "../../assets/data_core.png";
import BRIDGE from "../../assets/bridge.png";
import CAPTAINS_QUARTERS from "../../assets/captains_quarters.png";
import ENGINEERING_BAY from "../../assets/engineering_bay.png";
import OBSERVATION_DECK from "../../assets/observation_deck.png";
import MESS_HALL from "../../assets/mess_hall.png";
import AIRLOCK from "../../assets/airlock.png";
import CARGO_HOLD from "../../assets/cargo_hold.png";
import CRYO_BAY from "../../assets/cryo_bay.png";
import "./Board.scss";
import { useState, useEffect } from "react";
import { ApiClient } from "../../ApiClient";
import { DemoApiClient, DEMO_MODE } from "../../DemoApiClient";
import { prettifyName } from "../../utils/CharacterNameHelper";
import { Suspect } from "../console/Suspect";

// Use demo or real API based on DEMO_MODE
const Api = DEMO_MODE ? DemoApiClient : ApiClient;

export const Board = (props) => {
  "use strict";
  
  // USS Vesper Room States
  const [dataCore, setDataCore] = useState<string>("");
  const [dataCoreEngineering, setDataCoreEngineering] = useState<string>("");
  const [bridge, setBridge] = useState<string>("");
  const [bridgeCaptains, setBridgeCaptains] = useState<string>("");
  const [captainsQuarters, setCaptainsQuarters] = useState<string>("");
  const [dataCorebridge, setDataCoreBridge] = useState<string>("");
  const [bridgeObservation, setBridgeObservation] = useState<string>("");
  const [captainsMess, setCaptainsMess] = useState<string>("");
  const [engineeringBay, setEngineeringBay] = useState<string>("");
  const [engineeringObservation, setEngineeringObservation] = useState<string>("");
  const [observationDeck, setObservationDeck] = useState<string>("");
  const [observationMess, setObservationMess] = useState<string>("");
  const [messHall, setMessHall] = useState<string>("");
  const [engineeringAirlock, setEngineeringAirlock] = useState<string>("");
  const [observationCargo, setObservationCargo] = useState<string>("");
  const [messCryo, setMessCryo] = useState<string>("");
  const [airlock, setAirlock] = useState<string>("");
  const [airlockCargo, setAirlockCargo] = useState<string>("");
  const [cargoHold, setCargoHold] = useState<string>("");
  const [cargoCryo, setCargoCryo] = useState<string>("");
  const [cryoBay, setCryoBay] = useState<string>("");

  // Selection states for highlighting available moves
  const [isDataCoreSelected, setIsDataCoreSelected] = useState<boolean>(false);
  const [isDataCoreEngineeringSelected, setIsDataCoreEngineeringSelected] = useState<boolean>(false);
  const [isBridgeSelected, setIsBridgeSelected] = useState<boolean>(false);
  const [isBridgeCaptainsSelected, setIsBridgeCaptainsSelected] = useState<boolean>(false);
  const [isCaptainsQuartersSelected, setIsCaptainsQuartersSelected] = useState<boolean>(false);
  const [isDataCoreBridgeSelected, setIsDataCoreBridgeSelected] = useState<boolean>(false);
  const [isBridgeObservationSelected, setIsBridgeObservationSelected] = useState<boolean>(false);
  const [isCaptainsMessSelected, setIsCaptainsMessSelected] = useState<boolean>(false);
  const [isEngineeringBaySelected, setIsEngineeringBaySelected] = useState<boolean>(false);
  const [isEngineeringObservationSelected, setIsEngineeringObservationSelected] = useState<boolean>(false);
  const [isObservationDeckSelected, setIsObservationDeckSelected] = useState<boolean>(false);
  const [isObservationMessSelected, setIsObservationMessSelected] = useState<boolean>(false);
  const [isMessHallSelected, setIsMessHallSelected] = useState<boolean>(false);
  const [isEngineeringAirlockSelected, setIsEngineeringAirlockSelected] = useState<boolean>(false);
  const [isObservationCargoSelected, setIsObservationCargoSelected] = useState<boolean>(false);
  const [isMessCryoSelected, setIsMessCryoSelected] = useState<boolean>(false);
  const [isAirlockSelected, setIsAirlockSelected] = useState<boolean>(false);
  const [isAirlockCargoSelected, setIsAirlockCargoSelected] = useState<boolean>(false);
  const [isCargoHoldSelected, setIsCargoHoldSelected] = useState<boolean>(false);
  const [isCargoCryoSelected, setIsCargoCryoSelected] = useState<boolean>(false);
  const [isCryoBaySelected, setIsCryoBaySelected] = useState<boolean>(false);

  useEffect(() => {
    if (props.character !== "") {
      props.socket.on("update-board", async function (currentCharacter) {
        await resetBoard();
        const response = await Api.get("/players");

        for (var key of Object.keys(response)) {
          const player = response[key];
          const roomHall = player.room_hall;
          const characterName = player.character_name;
          const prettifiedCharacterName = prettifyName(characterName);

          setRoomOrHall(roomHall, prettifiedCharacterName);

          if (
            props.character === currentCharacter &&
            characterName === currentCharacter &&
            !player.allow_disapproval
          ) {
            const availableMoves = player.available_moves;
            for (var counter in availableMoves) {
              setRoomOrHallIsSelected(availableMoves[counter]);
            }
          }
        }
      });
    }
  }, [props.character]);

  const publishNewLocation = async (tag) => {
    const payload = { location: tag };
    const response = await Api.put(
      "/player/move/" + props.player,
      payload
    );
    if (response.error === undefined) {
      props.socket.emit(
        "channel-player-move-only",
        props.player + " (" + Suspect[props.character] + ") has moved to " + tag
      );
      props.socket.emit(
        "channel-current-player",
        response.current_player_info.player_name,
        response.current_player_info.character_name,
        Suspect[response.current_player_info.character_name]
      );
    }
  };

  const isEmpty = (str: string) => !str || 0 === str.length;
  const cleanRoom = (room: string, character: string) =>
    isEmpty(room)
      ? character
      : room.includes(character)
      ? room
      : room + ", " + character;

  const setRoomOrHall = (roomHall, prettifiedCharacterName) => {
    switch (roomHall) {
      case "data_core":
        setDataCore((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "data_core-bridge":
        setDataCoreBridge((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "bridge":
        setBridge((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "bridge-captains_quarters":
        setBridgeCaptains((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "captains_quarters":
        setCaptainsQuarters((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "data_core-engineering_bay":
        setDataCoreEngineering((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "bridge-observation_deck":
        setBridgeObservation((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "captains_quarters-mess_hall":
        setCaptainsMess((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "engineering_bay":
        setEngineeringBay((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "engineering_bay-observation_deck":
        setEngineeringObservation((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "observation_deck":
        setObservationDeck((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "observation_deck-mess_hall":
        setObservationMess((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "mess_hall":
        setMessHall((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "engineering_bay-airlock":
        setEngineeringAirlock((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "observation_deck-cargo_hold":
        setObservationCargo((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "mess_hall-cryo_bay":
        setMessCryo((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "airlock":
        setAirlock((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "airlock-cargo_hold":
        setAirlockCargo((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "cargo_hold":
        setCargoHold((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "cargo_hold-cryo_bay":
        setCargoCryo((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
      case "cryo_bay":
        setCryoBay((prev) => cleanRoom(prev, prettifiedCharacterName));
        break;
    }
  };

  const setRoomOrHallIsSelected = (roomOrHall) => {
    switch (roomOrHall) {
      case "data_core":
        setIsDataCoreSelected(true);
        break;
      case "data_core-bridge":
        setIsDataCoreBridgeSelected(true);
        break;
      case "bridge":
        setIsBridgeSelected(true);
        break;
      case "bridge-captains_quarters":
        setIsBridgeCaptainsSelected(true);
        break;
      case "captains_quarters":
        setIsCaptainsQuartersSelected(true);
        break;
      case "data_core-engineering_bay":
        setIsDataCoreEngineeringSelected(true);
        break;
      case "bridge-observation_deck":
        setIsBridgeObservationSelected(true);
        break;
      case "captains_quarters-mess_hall":
        setIsCaptainsMessSelected(true);
        break;
      case "engineering_bay":
        setIsEngineeringBaySelected(true);
        break;
      case "engineering_bay-observation_deck":
        setIsEngineeringObservationSelected(true);
        break;
      case "observation_deck":
        setIsObservationDeckSelected(true);
        break;
      case "observation_deck-mess_hall":
        setIsObservationMessSelected(true);
        break;
      case "mess_hall":
        setIsMessHallSelected(true);
        break;
      case "engineering_bay-airlock":
        setIsEngineeringAirlockSelected(true);
        break;
      case "observation_deck-cargo_hold":
        setIsObservationCargoSelected(true);
        break;
      case "mess_hall-cryo_bay":
        setIsMessCryoSelected(true);
        break;
      case "airlock":
        setIsAirlockSelected(true);
        break;
      case "airlock-cargo_hold":
        setIsAirlockCargoSelected(true);
        break;
      case "cargo_hold":
        setIsCargoHoldSelected(true);
        break;
      case "cargo_hold-cryo_bay":
        setIsCargoCryoSelected(true);
        break;
      case "cryo_bay":
        setIsCryoBaySelected(true);
        break;
    }
  };

  const resetBoard = async () => {
    const EMPTY = "";
    setDataCore(EMPTY);
    setDataCoreBridge(EMPTY);
    setBridge(EMPTY);
    setBridgeCaptains(EMPTY);
    setCaptainsQuarters(EMPTY);
    setDataCoreEngineering(EMPTY);
    setBridgeObservation(EMPTY);
    setCaptainsMess(EMPTY);
    setEngineeringBay(EMPTY);
    setEngineeringObservation(EMPTY);
    setObservationDeck(EMPTY);
    setObservationMess(EMPTY);
    setMessHall(EMPTY);
    setEngineeringAirlock(EMPTY);
    setObservationCargo(EMPTY);
    setMessCryo(EMPTY);
    setAirlock(EMPTY);
    setAirlockCargo(EMPTY);
    setCargoHold(EMPTY);
    setCargoCryo(EMPTY);
    setCryoBay(EMPTY);

    setIsDataCoreSelected(false);
    setIsDataCoreBridgeSelected(false);
    setIsBridgeSelected(false);
    setIsBridgeCaptainsSelected(false);
    setIsCaptainsQuartersSelected(false);
    setIsDataCoreEngineeringSelected(false);
    setIsBridgeObservationSelected(false);
    setIsCaptainsMessSelected(false);
    setIsEngineeringBaySelected(false);
    setIsEngineeringObservationSelected(false);
    setIsObservationDeckSelected(false);
    setIsObservationMessSelected(false);
    setIsMessHallSelected(false);
    setIsEngineeringAirlockSelected(false);
    setIsObservationCargoSelected(false);
    setIsMessCryoSelected(false);
    setIsAirlockSelected(false);
    setIsAirlockCargoSelected(false);
    setIsCargoHoldSelected(false);
    setIsCargoCryoSelected(false);
    setIsCryoBaySelected(false);
  };

  return (
    <table>
      <tbody>
        {/* Row 1: Data Core - Bridge - Captain's Quarters */}
        <tr>
          <Room
            room={DATA_CORE}
            character={dataCore}
            selected={isDataCoreSelected}
            tag="data_core"
            cellClick={publishNewLocation}
          />
          <Hall
            horizontal={true}
            character={dataCorebridge}
            selected={isDataCoreBridgeSelected}
            tag="data_core-bridge"
            cellClick={publishNewLocation}
          />
          <Room
            room={BRIDGE}
            character={bridge}
            selected={isBridgeSelected}
            tag="bridge"
            cellClick={publishNewLocation}
          />
          <Hall
            horizontal={true}
            character={bridgeCaptains}
            selected={isBridgeCaptainsSelected}
            tag="bridge-captains_quarters"
            cellClick={publishNewLocation}
          />
          <Room
            room={CAPTAINS_QUARTERS}
            character={captainsQuarters}
            selected={isCaptainsQuartersSelected}
            tag="captains_quarters"
            cellClick={publishNewLocation}
          />
        </tr>
        {/* Row 2: Vertical hallways */}
        <tr>
          <Hall
            horizontal={false}
            character={dataCoreEngineering}
            selected={isDataCoreEngineeringSelected}
            tag="data_core-engineering_bay"
            cellClick={publishNewLocation}
          />
          <Empty />
          <Hall
            horizontal={false}
            character={bridgeObservation}
            selected={isBridgeObservationSelected}
            tag="bridge-observation_deck"
            cellClick={publishNewLocation}
          />
          <Empty />
          <Hall
            horizontal={false}
            character={captainsMess}
            selected={isCaptainsMessSelected}
            tag="captains_quarters-mess_hall"
            cellClick={publishNewLocation}
          />
        </tr>
        {/* Row 3: Engineering Bay - Observation Deck - Mess Hall */}
        <tr>
          <Room
            room={ENGINEERING_BAY}
            character={engineeringBay}
            selected={isEngineeringBaySelected}
            tag="engineering_bay"
            cellClick={publishNewLocation}
          />
          <Hall
            horizontal={true}
            character={engineeringObservation}
            selected={isEngineeringObservationSelected}
            tag="engineering_bay-observation_deck"
            cellClick={publishNewLocation}
          />
          <Room
            room={OBSERVATION_DECK}
            character={observationDeck}
            selected={isObservationDeckSelected}
            tag="observation_deck"
            cellClick={publishNewLocation}
          />
          <Hall
            horizontal={true}
            character={observationMess}
            selected={isObservationMessSelected}
            tag="observation_deck-mess_hall"
            cellClick={publishNewLocation}
          />
          <Room
            room={MESS_HALL}
            character={messHall}
            selected={isMessHallSelected}
            tag="mess_hall"
            cellClick={publishNewLocation}
          />
        </tr>
        {/* Row 4: Vertical hallways */}
        <tr>
          <Hall
            horizontal={false}
            character={engineeringAirlock}
            selected={isEngineeringAirlockSelected}
            tag="engineering_bay-airlock"
            cellClick={publishNewLocation}
          />
          <Empty />
          <Hall
            horizontal={false}
            character={observationCargo}
            selected={isObservationCargoSelected}
            tag="observation_deck-cargo_hold"
            cellClick={publishNewLocation}
          />
          <Empty />
          <Hall
            horizontal={false}
            character={messCryo}
            selected={isMessCryoSelected}
            tag="mess_hall-cryo_bay"
            cellClick={publishNewLocation}
          />
        </tr>
        {/* Row 5: Airlock - Cargo Hold - Cryo Bay */}
        <tr>
          <Room
            room={AIRLOCK}
            character={airlock}
            selected={isAirlockSelected}
            tag="airlock"
            cellClick={publishNewLocation}
          />
          <Hall
            horizontal={true}
            character={airlockCargo}
            selected={isAirlockCargoSelected}
            tag="airlock-cargo_hold"
            cellClick={publishNewLocation}
          />
          <Room
            room={CARGO_HOLD}
            character={cargoHold}
            selected={isCargoHoldSelected}
            tag="cargo_hold"
            cellClick={publishNewLocation}
          />
          <Hall
            horizontal={true}
            character={cargoCryo}
            selected={isCargoCryoSelected}
            tag="cargo_hold-cryo_bay"
            cellClick={publishNewLocation}
          />
          <Room
            room={CRYO_BAY}
            character={cryoBay}
            selected={isCryoBaySelected}
            tag="cryo_bay"
            cellClick={publishNewLocation}
          />
        </tr>
      </tbody>
    </table>
  );
};
