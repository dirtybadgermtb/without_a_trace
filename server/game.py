import numpy as np
import random
from player import Player
from room import Room
from collections import OrderedDict

# === WITHOUT A TRACE - Space Theme ===
# USS Vesper Research Vessel Layout

# Indicates whether hallway is free
HALLWAY_STATE = {
    'data_core-bridge': True,
    'data_core-engineering_bay': True,
    'bridge-captains_quarters': True,
    'bridge-observation_deck': True,
    'captains_quarters-mess_hall': True,
    'engineering_bay-observation_deck': True,
    'engineering_bay-airlock': True,
    'observation_deck-mess_hall': True,
    'observation_deck-cargo_hold': True,
    'mess_hall-cryo_bay': True,
    'airlock-cargo_hold': True,
    'cargo_hold-cryo_bay': True
}

INITIAL_PLAYER_LOCATIONS = {
    'dr_nova': 'bridge-captains_quarters',
    'engineer_orion': 'data_core-engineering_bay',
    'commander_sirius': 'captains_quarters-mess_hall',
    'agent_vega': 'engineering_bay-airlock',
    'pilot_altair': 'airlock-cargo_hold',
    'tech_cassini': 'cargo_hold-cryo_bay'
}

ROOMS = [
    'data_core', 'bridge', 'observation_deck', 'captains_quarters', 'mess_hall',
    'engineering_bay', 'airlock', 'cargo_hold', 'cryo_bay'
]

WEAPONS = ['plasma_cutter', 'compact_rail_gun', 'stun_blaster', 'plasma_blade', 'tether_cable', 'mag_driver']

CHARACTERS = [
    'dr_nova', 'engineer_orion', 'commander_sirius', 'agent_vega',
    'pilot_altair', 'tech_cassini'
]


class CluelessGame:

    def __init__(self):
        # Initialize the rooms - USS Vesper Layout
        # Secret passages: Data Core <-> Cryo Bay, Captain's Quarters <-> Airlock
        self.rooms = dict()
        self.rooms['data_core'] = Room('data_core', 'cryo_bay',
                                       ['data_core-engineering_bay', 'data_core-bridge'])
        self.rooms['bridge'] = Room(
            'bridge', None, ['bridge-observation_deck', 'bridge-captains_quarters', 'data_core-bridge'])
        self.rooms['captains_quarters'] = Room('captains_quarters', 'airlock',
                                               ['captains_quarters-mess_hall', 'bridge-captains_quarters'])
        self.rooms['engineering_bay'] = Room(
            'engineering_bay', None,
            ['data_core-engineering_bay', 'engineering_bay-airlock', 'engineering_bay-observation_deck'])
        self.rooms['observation_deck'] = Room('observation_deck', None, [
            'bridge-observation_deck', 'observation_deck-cargo_hold', 'engineering_bay-observation_deck',
            'observation_deck-mess_hall'
        ])
        self.rooms['mess_hall'] = Room(
            'mess_hall', None,
            ['captains_quarters-mess_hall', 'mess_hall-cryo_bay', 'observation_deck-mess_hall'])
        self.rooms['airlock'] = Room(
            'airlock', 'captains_quarters',
            ['engineering_bay-airlock', 'airlock-cargo_hold'])
        self.rooms['cargo_hold'] = Room(
            'cargo_hold', None,
            ['observation_deck-cargo_hold', 'airlock-cargo_hold', 'cargo_hold-cryo_bay'])
        self.rooms['cryo_bay'] = Room('cryo_bay', 'data_core',
                                      ['mess_hall-cryo_bay', 'cargo_hold-cryo_bay'])

        self.hallways = HALLWAY_STATE.copy()

        # Player dictionary -> key: player name, value: player properties
        # Using an ordered dict to preserve ordering of player registration
        self.players = OrderedDict()

        self.game_answer = self.create_game_answer()
        print(self.game_answer)
        self.current_player = None
        self.suggesting_player = None
        self.game_started = False
        self.player_moved = False

    # Randomly create the mystery case
    def create_game_answer(self):
        character = random.choice(CHARACTERS)
        room = random.choice(ROOMS)
        weapon = random.choice(WEAPONS)

        WEAPONS.remove(weapon)
        CHARACTERS.remove(character)
        ROOMS.remove(room)

        return (character, room, weapon)

    # Create a new player and assign an initial starting position on the board
    def create_player(self, player_name, character_name):
        new_player = Player(player_name, character_name, None)

        new_player.available_moves.append(
            INITIAL_PLAYER_LOCATIONS.get(character_name))

        self.players[player_name] = new_player

        return new_player

    # Algorithm to distribute random cards to the players
    def distribute_cards(self):
        # Get all the cards
        cards = ROOMS.copy() + WEAPONS.copy() + CHARACTERS.copy()

        while len(cards) != 0:
            # Get a random card and remove from deck
            random_card = random.choice(cards)
            cards.remove(random_card)

            # Append new card to player hand
            self.players.get(self.current_player).cards.append(random_card)

            # Move on to the next player
            self.current_player = self.players.get(
                self.current_player).next_player

        self.current_player = [*self.players.keys()][0]
        self.game_started = True

    # Loop through the player list and set the play order
    def set_player_order(self):
        for player_index, player_object in enumerate(self.players.values()):
            if player_index + 1 < len(self.players.values()):
                player_object.next_player = [*self.players.keys()
                                             ][player_index + 1]
            else:
                player_object.next_player = [*self.players.keys()][0]

        # The current player is the first registered player
        self.current_player = [*self.players.keys()][0]
        [*self.players.values()][0].allow_move = True

        return

    # Call to reset for a new game
    def reset(self):
        CHARACTERS.append(self.game_answer[0])
        ROOMS.append(self.game_answer[1])
        WEAPONS.append(self.game_answer[2])

        self.players = OrderedDict()
        self.game_answer = self.create_game_answer()
        self.current_player = None
        self.suggesting_player = None
        self.game_started = False
        self.player_moved = False

        return
