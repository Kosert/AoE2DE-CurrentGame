import { MatchData, PlayerData } from "./matches/matches-models";
import { DataManager } from "./data-manager";
import { Match, Player, Profile, Team } from "./public/front-end-api-models";
import { UserProfile } from "./search/search-api";

export class ModelConverter {

    private dataManager = new DataManager()

    private groupBy = <T, Q>(array: T[], predicate: (value: T, index: number, array: T[]) => Q) =>
    array.reduce((map, value, index, array) => {
        const key = predicate(value, index, array);
        map.get(key)?.push(value) ?? map.set(key, [value]);
        return map;
    }, new Map<Q, T[]>());


    convertMatch(matchData: MatchData): Match {
        const teams = this.convertToTeams(matchData.players)
        return new Match(
            matchData.matchId,
            Date.parse(matchData.started),
            matchData.leaderboardId,
            matchData.leaderboardName,
            matchData.name,
            matchData.privacy,
            matchData.hideCivs,
            matchData.map,
            matchData.mapName,
            matchData.fullTechTree,
            teams,
            matchData.averageRating,
        )
    }

    convertToTeams(players: PlayerData[]): Team[] {
        const teams = this.groupBy(players, player => player.teamName);
        return [...teams.keys()].map((teamName, index) => {
            const players = teams.get(teamName)!
            const convertedPlayers = players.map(it => this.convertPlayer(it))

            const playerCivNames = convertedPlayers.map(it => it.civName)
            const bonuses = new Set(this.dataManager.getBonuses(playerCivNames))

            return new Team(teamName, convertedPlayers, [...bonuses])
        })
    }

    convertPlayer(playerData: PlayerData): Player {
        return new Player(
            playerData.profileId,
            playerData.name,
            playerData.rating,
            playerData.civ,
            playerData.civName,
            playerData.color,
            playerData.slot,
            playerData.status,
            playerData.team,
            playerData.country
        )
    }

    convertProfile(profile: UserProfile): Profile {
        return new Profile(
            profile.profileId,
            profile.steamId,
            profile.name,
            profile.country,
        )
    }
}