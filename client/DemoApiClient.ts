import { Suspect } from "./components/console/Suspect";
import { Room } from "./components/console/Room";
import { Weapon } from "./components/console/Weapon";

// Demo mode configuration - set to true to run without backend
export const DEMO_MODE = true;

// Demo game state
interface DemoGameState {
  isPlaying: boolean;
  currentPlayer: string;
  players: Map<string, { character_name: string; cards: string[]; room_hall?: string }>;
}

const demoState: DemoGameState = {
  isPlaying: false,
  currentPlayer: "",
  players: new Map(),
};

// Card pools for demo
const allCards = {
  suspects: Object.keys(Suspect),
  rooms: Object.keys(Room),
  weapons: Object.keys(Weapon),
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDemoCards(): string[] {
  // Return random cards for demo player
  const suspects = shuffleArray(allCards.suspects).slice(0, 2);
  const rooms = shuffleArray(allCards.rooms).slice(0, 2);
  const weapons = shuffleArray(allCards.weapons).slice(0, 2);
  return [...suspects, ...rooms, ...weapons];
}

export class DemoApiClient {
  public static get = async (path: string): Promise<any> => {
    console.log(`[DEMO] GET ${path}`);
    await DemoApiClient.simulateDelay();

    if (path === "/start") {
      return { isPlaying: demoState.isPlaying };
    }

    // GET /players - returns all players and their state
    if (path === "/players") {
      const result: Record<string, any> = {};
      demoState.players.forEach((data, playerName) => {
        result[playerName] = {
          character_name: data.character_name,
          room_hall: data.room_hall || "bridge",
          allow_suggestion: true,
          allow_disapproval: false,
          available_moves: ["data_core", "captains_quarters", "observation_deck"],
        };
      });
      return result;
    }

    // GET /player/:name
    if (path.startsWith("/player/")) {
      const playerName = path.replace("/player/", "");
      const playerData = demoState.players.get(playerName);
      if (playerData) {
        return {
          cards: playerData.cards,
          room_hall: playerData.room_hall || "bridge",
          allow_suggestion: true,
          available_moves: ["data_core", "captains_quarters", "observation_deck"],
        };
      }
      return {
        cards: getDemoCards(),
        room_hall: "bridge",
        allow_suggestion: true,
        available_moves: ["data_core", "captains_quarters"],
      };
    }

    return {};
  };

  public static post = async (path: string, body?: any): Promise<any> => {
    console.log(`[DEMO] POST ${path}`, body);
    await DemoApiClient.simulateDelay();

    if (path === "/start") {
      demoState.isPlaying = true;
      const playerName = demoState.currentPlayer || "DemoPlayer";
      const character = demoState.players.get(playerName)?.character_name || "dr_nova";
      
      return {
        current_player: playerName,
        [playerName]: {
          character_name: character,
        },
      };
    }

    if (path === "/reset") {
      demoState.isPlaying = false;
      demoState.players.clear();
      return { reset: true };
    }

    return {};
  };

  public static put = async (path: string, body: any): Promise<any> => {
    console.log(`[DEMO] PUT ${path}`, body);
    await DemoApiClient.simulateDelay();

    const playerName = demoState.currentPlayer || "DemoPlayer";
    const character = demoState.players.get(playerName)?.character_name || "dr_nova";

    // PUT /player/:name - register player
    if (path.match(/^\/player\/[^\/]+$/) && body.character_name) {
      const name = path.replace("/player/", "");
      const cards = getDemoCards();
      
      demoState.players.set(name, {
        character_name: body.character_name,
        cards: cards,
        room_hall: "bridge",
      });
      demoState.currentPlayer = name;
      
      return { success: true };
    }

    // PUT /player/move/:name - move player
    if (path.startsWith("/player/move/")) {
      const playerData = demoState.players.get(playerName);
      if (playerData && body.location) {
        playerData.room_hall = body.location;
      }
      return {
        current_player_info: {
          player_name: playerName,
          character_name: character,
        },
      };
    }

    // PUT /player/suggestions/:name - make suggestion
    if (path.startsWith("/player/suggestions/")) {
      console.log(`[DEMO] Suggestion: ${body.suggested_character} in ${body.suggested_room} with ${body.suggested_weapon}`);
      return {
        current_player_info: {
          player_name: playerName,
          character_name: character,
        },
      };
    }

    // PUT /player/accusation/:name - make accusation
    if (path.startsWith("/player/accusation/")) {
      console.log(`[DEMO] Accusation: ${body.accused_character} in ${body.accused_room} with ${body.accused_weapon}`);
      // Random win/lose for demo
      const guess = Math.random() > 0.5;
      return {
        guess: guess,
        current_player_info: {
          player_name: playerName,
          character_name: character,
        },
      };
    }

    // PUT /player/disprove
    if (path === "/player/disprove") {
      return {
        current_player_info: {
          player_name: playerName,
          character_name: character,
        },
      };
    }

    return { success: true };
  };

  public static delete = async (path: string): Promise<any> => {
    console.log(`[DEMO] DELETE ${path}`);
    return {};
  };

  private static simulateDelay = async (): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 100));
  };
}

// Mock socket that just logs events
export class DemoSocket {
  private listeners: Map<string, Function[]> = new Map();

  connect(url: string, options: any) {
    console.log(`[DEMO] Socket would connect to: ${url}`);
    return this;
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    return this;
  }

  emit(event: string, ...args: any[]) {
    console.log(`[DEMO] Socket emit: ${event}`, args);
    
    // Simulate server responses for demo
    if (event === "channel-start") {
      setTimeout(() => {
        this.trigger("start", "Game started in demo mode!");
      }, 100);
    }

    if (event === "channel-current-player") {
      const [playerName, charName, charDisplay] = args;
      setTimeout(() => {
        // Use player and character info in the display message
        const displayText = charDisplay || `${playerName} (${charName})`;
        this.trigger("current-player", `${displayText}'s`);
      }, 100);
    }

    return this;
  }

  private trigger(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(...args));
  }
}

// Create a singleton demo socket
const demoSocketInstance = new DemoSocket();

export const DemoSocketIO = {
  connect: (url: string, options: any) => {
    return demoSocketInstance.connect(url, options);
  },
};
