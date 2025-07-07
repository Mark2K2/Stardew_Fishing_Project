import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import express from 'express';
import Game from './game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8081;

// WEBSOCKET
const wss = new WebSocketServer({ port: 8080 });
let wsConnection = undefined;

wss.on('connection', function connection(ws){
    ws.on('error', console.error);
    wsConnection = ws;
    console.log('WebSocket conectado')
})

// Create a function to send data and call it from other files
export function sendData(data) {
    if (wsConnection && wsConnection.readyState === wsConnection.OPEN){
        wsConnection.send(JSON.stringify(data));
    }else{
        console.error("No hay conexión para realizar el envío");
    }
}

app.use(cors());
app.use(express.json());
const publicFolder = path.join(__dirname, '/public');
app.use(express.static(publicFolder));

const game = Game();

// ENDPOINTS
app.get('/cast_line', (req,res) => { // Called every time CAST button is clicked while player is standing
    const result = game.castLine();
    if(result !== null){
        res.status(400).json(result);
    }else{
        res.sendStatus(200);
    }
})

app.get('/wait_for_bite', (req,res) => { // Called right after /cast_line returns 200
    game.waitForBite()
    .then(() => {
        res.sendStatus(200);
    })
    .catch((errorCode) => {
        const error = { errorCode };
        res.status(400).json(error);
    });
})

app.get('/reel_in', (req, res) => { // Called every time START button is clicked when player has cast the line
    const result = game.reelIn();
    if(result.errorCode){ res.status(400).json(result); }
    if(result.difficulty){ res.status(200).json(result); }
})

app.get('/get_mini_game_info', (req, res) => { // Frequently called
    const result = game.getCatchingMinigameInfo();
    res.status(200).json(result);
})

app.get('/move_catch_bar_up', (req, res) => { // Called everytime PULL button is clicked while playing minigame
    game.updateCatchBarDirection("up");
    res.sendStatus(200);
})

app.get('/stop_moving_catch_bar_up', (req, res) => { // Called everytime PULL button is not clicked while playing minigame
    game.updateCatchBarDirection("down");
    res.sendStatus(200);
})


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});
