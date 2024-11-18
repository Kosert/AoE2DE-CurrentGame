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

    // matchId to MatchData
    private ongoingMatches: MatchData[] = []
    private listeners: Listener[] = []

    private ws: WebSocket | undefined

    private log(...message: any[]) {
        console.log(new Date().toISOString() + " - ", ...message)
    }

    private connectWebSocket() {
        const self = this
        this.ws = new WebSocket("wss://socket.aoe2companion.com/listen?handler=ongoing-matches")
        this.ws.on('error', function error(err: Error) {
            self.log("MatchesApi: Websocket error - ", err)
        })

        this.ws.on("close", function close(code: number, reason: Buffer) {
            self.log("MatchesApi: Websocket closed - ", code, reason.toString('utf8'))
            self.updateWebSocketState()
        })

        this.ws.on('open', function open() {
            self.log("MatchesApi: Websocket to aoe2companion connected")
        })

        this.ws.on('message', function message(data: string) {
            self.parseMessage(data)
        })
    }

    private parseMessage(data: string) {
        const received = JSON.parse(data) as MatchEvent[]
        const idsToRemove = received.filter(event => event.type == EventType.MATCH_REMOVED)
            .map(event => event.data.matchId)

        if (idsToRemove.length > 0) {
            this.log("MatchesApi: Removing %d matches", idsToRemove.length)
        }

        this.ongoingMatches = this.ongoingMatches.filter(it => !idsToRemove.includes(it.matchId))
            
        const addEvents = received.filter(event => event.type == EventType.MATCH_ADDED)
        if (addEvents.length > 0) {
            this.log("MatchesApi: Adding %d matches", addEvents.length)
        }
        addEvents.forEach(it => {
            this.ongoingMatches.push(it.data)
        })

        const listenersToUpdate: Listener[] = []
        this.listeners.filter(it => idsToRemove.includes(it.currentMatchId))
            .forEach(it => listenersToUpdate.push(it))

        const playerIdsToUpdate = addEvents.flatMap(it => it.data.players)
            .map(it => it.profileId)
            .filter(it => it != -1)

        this.listeners.forEach(it => {
            if (playerIdsToUpdate.find(id => id == it.playerId)) {
                listenersToUpdate.push(it)
            }
        })

        listenersToUpdate.forEach(it => {
            this.updateListener(it)
        })
    }

    private timeoutJob: NodeJS.Timeout | undefined
    
    private updateWebSocketState() {
        const self = this
        const wsConnected = this.ws?.readyState == WebSocket.OPEN || this.ws?.readyState == WebSocket.CONNECTING

        if (this.listeners.length > 0 && !wsConnected) {
            this.log("Reconnecting websocket")
            self.connectWebSocket()
        }
        
        if (this.listeners.length == 0 && wsConnected) {
            this.log("Scheduling websocket disconnect")
            this.timeoutJob = setTimeout(() => {
                self.timeoutJob = undefined
                self.ws?.close()
                self.ongoingMatches = []
            }, 5000)
        } else {
            if (this.timeoutJob) {
                this.log("Aborting websocket disconnect")
                clearTimeout(this.timeoutJob)
                this.timeoutJob = undefined
            }
        }
    }

    private updateListener(listener: Listener) {
        const match = this.getForPlayerId(listener.playerId)
        this.log("Updating: ", listener.socketId, listener.playerId, match?.matchId)
        listener.currentMatchId = match?.matchId ?? -1
        listener.callback(match)
    }

    private getForPlayerId(playerId: number): MatchData | undefined {
        const matches = this.ongoingMatches.filter(it => it.players?.some(player => player.profileId == playerId))
        const latestGameTime = Math.max(...matches.map(it => Date.parse(it.started)));
        return matches.find(it => Date.parse(it.started) == latestGameTime)
    }

    registerForChanges(socketId: string, playerId: number, callback: (match: MatchData | undefined) => void) {
        this.unregisterListener(socketId)
        this.log("MatchesApi: Registering", socketId, "for", playerId)
        const newListener = new Listener(socketId, playerId, -1, callback)
        this.updateListener(newListener)
        this.listeners.push(newListener)
        this.updateWebSocketState()
    }

    unregisterListener(socketId: string) {
        const existingIndex = this.listeners.findIndex(it => it.socketId == socketId)
        if (existingIndex != -1) {
            const removed = this.listeners.splice(existingIndex, 1)[0]
            this.log("MatchesApi: Unregistered", socketId, "for", removed.playerId)
            this.updateWebSocketState()
        }
    }
}