export class Match {
    constructor(
        readonly matchId: number,
        readonly started: number,
        readonly leaderboardId: string,
        readonly leaderboardName: string,
        readonly name: string,
        readonly privacy: number,
        readonly hideCivs: boolean,
        readonly map: string,
        readonly mapName: string,
        readonly fullTechTree: boolean,
        readonly teams: Team[],
        readonly averageRating: number,
    ) {}
}

export class Team {
    constructor(
        readonly teamName: string,
        readonly players: Player[],
        readonly bonuses: string[]
    ) {}
}


export class Player {
    constructor(
        readonly profileId: number,
        readonly name: string,
        readonly rating: number,
        readonly civ: string,
        readonly civName: string,
        readonly color: number,
        readonly slot: number,
        readonly status: string,
        readonly team: number,
        readonly country: string
    ) {}
}

export class Profile {
    constructor(
        readonly profileId: number,
        readonly steamId: string,
        readonly name: string,
        readonly country: string,
    ) {}
}