export enum EventType {
    MATCH_ADDED = "matchAdded",
    MATCH_REMOVED = "matchRemoved"
} 

export interface MatchEvent {
    data: MatchData,
    type: EventType
}

export interface PlayerData {
    profileId: number;
    name: string;
    rating: number;
    civ: string;
    civName: string;
    civImageUrl: string;
    color: number;
    colorHex: string;
    slot: number;
    status: string;
    team: number;
    country: string;
    verified: boolean;
    games: number;
    wins: number;
    losses: number;
    drops: number;
    teamName: string;
}

export interface MatchData {
    matchId: number;
    started: string;
    finished: null;
    leaderboardId: string;
    leaderboardName: string;
    name: string;
    server: string;
    internalLeaderboardId: number;
    privacy: number;
    map: string;
    mapName: string;
    mapImageUrl: string;
    difficulty: number;
    startingAge: number;
    fullTechTree: boolean;
    allowCheats: boolean;
    empireWarsMode: boolean;
    endingAge: number;
    gameMode: string;
    gameModeName: string;
    lockSpeed: boolean;
    lockTeams: boolean;
    mapSize: number;
    population: number;
    hideCivs: boolean;
    recordGame: boolean;
    regicideMode: boolean;
    gameVariant: number;
    resources: number;
    sharedExploration: boolean;
    speed: number;
    speedName: string;
    suddenDeathMode: boolean;
    teamPositions: boolean;
    teamTogether: boolean;
    treatyLength: number;
    turboMode: boolean;
    victory: number;
    revealMap: number;
    scenario: null;
    totalSlotCount: number;
    blockedSlotCount: number;
    players: PlayerData[];
    averageRating: number;
}