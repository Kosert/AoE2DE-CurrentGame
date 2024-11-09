
import handlebars from 'handlebars';
import { Match, Player } from './front-end-api-models';
import { Socket } from "socket.io-client"
import { DefaultEventsMap } from 'socket.io';

let playerTemplate: HandlebarsTemplateDelegate<Player>
let teamTemplate: HandlebarsTemplateDelegate<{ teamName: string, hideDivider: boolean }>

function createTeamHtml(teamData: { teamName: string, hideDivider: boolean, bonuses: string }): NodeListOf<ChildNode> {
    const htmlString = teamTemplate(teamData)
    const div = document.createElement('div')
    div.innerHTML = htmlString.trim()
    return div.childNodes
}

function createPlayerHtml(player: Player): HTMLElement {
    const htmlString = playerTemplate(player)
    const div = document.createElement('div')
    div.innerHTML = htmlString.trim()
    return div.firstChild as HTMLElement
}

window.onload = async function () {
    const playerTemplateSource = document.getElementById("player-template")!.innerHTML;
    playerTemplate = Handlebars.compile(playerTemplateSource)
    const teamTemplateSource = document.getElementById("team-template")!.innerHTML;
    teamTemplate = Handlebars.compile(teamTemplateSource)

    const params = new URLSearchParams(window.location.search)
    const playerId = params.get("playerId") ?? ""

    const url = [location.protocol, "//", location.host].join("")
    // @ts-expect-error
    const socket = io(url, { path: location.pathname + "/socket.io" }) as Socket<DefaultEventsMap, DefaultEventsMap>

    socket.on("connect", () => {
        console.log("Socket connected")

        socket.on("update", (match: Match) => {
            setState(match)
        })

        socket.emit("register", playerId)
    })

    socket.on("data", (match: Match) => {
        console.log("Socket message received")

    })

    // getCurrentMatch(playerId)
    //     .then(match => setState(match))
    //     .catch(err => { console.log(err) })
}

// async function getCurrentMatch(playerId: string): Promise<Match> {
//     return fetch("/api/currentMatch?playerId=" + playerId).then(response => {
//         if (response.status == 404) {
//             return undefined
//         } if (!response.ok) {
//             throw new Error(response.statusText)
//         }
//         return response.json()
//     })
// }

function setState(data: Match | undefined) {
    const mainContainer = document.getElementById("main-container")!
    mainContainer.innerHTML = ""

    const header = document.getElementById("header")!
    if (!data) {
        header.innerText = "Player is not currently in game"
        return
    } else {
        header.innerText = "Current game:"
    }

    data.teams.forEach((team, index) => {
        const bonusesText = team.bonuses.join("<br>")
        const teamNodes = createTeamHtml({ "teamName": team.teamName, "hideDivider": index == 0, "bonuses": bonusesText })

        const mainHtmlElement = teamNodes[2] as HTMLElement
        const playersContainer = mainHtmlElement.getElementsByClassName("players-container")[0]
        team.players.sort((a, b) => a.color - b.color).forEach(player => {
            playersContainer.appendChild(createPlayerHtml(player))
        })

        teamNodes.forEach(it => {
            mainContainer.appendChild(it)
        })
    })
}