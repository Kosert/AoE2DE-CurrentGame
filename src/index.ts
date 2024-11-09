import * as path from 'path';
import bodyParser from "body-parser"
import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import { MatchesApi } from "./matches/matches-api";
import { ModelConverter } from "./model-converter";
import { SearchApi } from "./search/search-api";
import { parseIntParam, parseStringParam } from "./query-parser";
import { MatchData } from "./matches/matches-models";

const app = express()
const server = require("http").createServer(app)

const matchesApi = new MatchesApi()
const searchApi = new SearchApi()
const modelConverter = new ModelConverter()

morgan.token(`colorstatus`, (req: Request, res: Response) => {
    const status = res.headersSent ? res.statusCode : 0
    const color = status >= 500 ? 31 // red
        : status >= 400 ? 33 // yellow
            : status >= 300 ? 36 // cyan
                : status >= 200 ? 32 // green
                    : 0 // no color
    return `\x1b[${color}m${status ? status : "-"}\x1b[0m`
})

app.use(morgan(":date[iso] :method :url :colorstatus :response-time ms - :res[content-length]", {
    skip: function (req: Request, res: Response) {
        return res.statusCode < 400 && req.originalUrl.includes("/assets/")
    }
}))

app.use(bodyParser.json())

app.use("/public", express.static(__dirname + "/public"))

// ===== BROWSER ENDPOINTS =====
app.get("/", function (req: Request, res) {
    res.sendFile(path.resolve(__dirname, "./../html/index.html"))
})

app.get("/player", function (req: Request, res) {
    res.sendFile(path.resolve(__dirname, "./../html/player.html"))
})

// ===== API ENDPOINTS =====
app.get("/api/search", function (req: Request, res) {
    const query = parseStringParam(req.query, "query")
    searchApi.search(query ?? "")
        .then(profiles => {
            res.send(profiles.map(it => modelConverter.convertProfile(it)))
        }).catch(err => {
            if (err == "Invalid query") {
                res.status(400).send({ error: "Invalid parameter: query" })
            } else if (err == "API error") {
                res.status(500).send({ error: "API error occurred" })
            } else {
                res.status(500).send({ error: "Unknown error occurred" })
            }
        })
})


app.get("/api/currentMatch", function (req: Request, res) {
    const playerId = parseIntParam(req.query, "playerId")
    if (!playerId) {
        res.status(400).send({ error: "Invalid parameter: playerId" })
        return
    }

    const matchData = matchesApi.getForPlayerId(playerId)
    if (!matchData) {
        res.status(404).send({ error: "No ongoing match found for provided id" })
        return
    }

    const match = modelConverter.convertMatch(matchData)
    res.send(match)
})

// ===== WEBSOCKET ENDPOINT ======
const io = new Server(server, { path: "/player/socket.io" /* options */ });
io.on("connection", (socket) => {

    socket.on("register", (playerId) => {
        matchesApi.registerForChanges(socket.id, playerId, (matchData: MatchData | undefined) => {
            const match = matchData ? modelConverter.convertMatch(matchData) : undefined
            socket.emit("update", match)
        })
    })

    socket.on("disconnect", (reason) => {
        matchesApi.unregisterListener(socket.id)
    })
})

// ===== FALLBACK ENDPOINTS =====
app.use(function (req, res) {
    //todo cool 404 html
    res.status(404).send({ error: "NOT_FOUND" })
})

app.use(function (err: any, req: Request, res: Response, next: any) {
    console.log(err)
    //todo cool 500 html
    res.status(500).send({ error: "INTERNAL_SERVER_ERROR" })
})

server.listen(3000, function () {
    console.log(`Server started on ${server.address().port}`);
});

