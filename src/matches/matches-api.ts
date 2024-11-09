import WebSocket from 'ws'
import { MatchEvent, MatchData, EventType } from './matches-models';

class Listener {
    constructor(
        readonly socketId: string,
        readonly playerId: number,
        public currentMatchId: number,
        readonly callback: (match: MatchData | undefined) => void
    ) {}
}

export class MatchesApi {

    private ws: WebSocket

    // matchId to MatchData
    private ongoingMatches: MatchData[] = []
    private listeners: Listener[] = []

    constructor() {
        const self = this

        this.ws = new WebSocket("wss://socket.aoe2companion.com/listen?handler=ongoing-matches")
        this.ws.on('error', console.error) //todo reconnect

        this.ws.on('open', function open() {
            console.log("MatchesApi: Websocket to aoe2companion connected")
        })

        this.ws.on('message', function message(data: string) {
            self.parseMessage(data)
        })
    }

    private parseMessage(data: string) {
        const received = JSON.parse(data) as MatchEvent[]
        console.log('MatchesApi: received: %s events', received.length)

        const idsToRemove = received.filter(event => event.type == EventType.MATCH_REMOVED)
            .map(event => event.data.matchId)

        if (idsToRemove.length > 0) {
            console.log("MatchesApi: Removing %d matches", idsToRemove.length)
        }

        this.ongoingMatches = this.ongoingMatches.filter(it => !idsToRemove.includes(it.matchId))
            
        const addEvents = received.filter(event => event.type == EventType.MATCH_ADDED)
        if (addEvents.length > 0) {
            console.log("MatchesApi: Adding %d matches", addEvents.length)
        }
        addEvents.forEach(it => {
            this.ongoingMatches.push(it.data)
        })

        const listenersToUpdate: Listener[] = []
        this.listeners.filter(it => idsToRemove.includes(it.currentMatchId))
            .forEach(it => listenersToUpdate.push(it))

        const playerIdsToUpdate = addEvents.flatMap(it => it.data.players).map(it => it.profileId)
        this.listeners.filter(it => playerIdsToUpdate.includes(it.playerId))
            .forEach(it => listenersToUpdate.push(it))

        listenersToUpdate.forEach(it => {
            this.updateListener(it)
        })
    }

    private updateListener(listener: Listener) {
        const current = this.getForPlayerId(listener.playerId)
        listener.currentMatchId = current?.matchId ?? -1
        listener.callback(current)
    }

    getForPlayerId(playerId: number): MatchData | undefined {
        const matches = this.ongoingMatches.filter(it => it.players?.some(player => player.profileId == playerId))
        const latestGameTime = Math.max(...matches.map(it => Date.parse(it.started)));
        return matches.find(it => Date.parse(it.started) == latestGameTime)
    }

    registerForChanges(socketId: string, playerId: number, callback: (match: MatchData | undefined) => void) {
        this.unregisterListener(socketId)
        console.log("MatchesApi: Registering", socketId, "for", playerId)
        const newListener = new Listener(socketId, playerId, -1, callback)
        this.updateListener(newListener)
        this.listeners.push(newListener)
    }

    unregisterListener(socketId: string) {
        const existingIndex = this.listeners.findIndex(it => it.socketId == socketId)
        if (existingIndex != -1) {
            const removed = this.listeners.splice(existingIndex, 1)[0]
            console.log("MatchesApi: Unregistered", socketId, "for", removed.playerId)
        }
    }
}