import { CATCH_BAR_INITIAL_POSITION, computeCatchBarCurrentPosition } from "./public/globals.js";
import { sendData } from "./app.js";


export default function CatchBar(swappedDirectionCallback){ // callback function called every time the catch bar changes direction
    //local variables
    let lastSwapAt; //Timestamp of the last direction change
    let lastSwapPosition; //Position where the catch bar last changed position
    let direction; //Current movement position up or down

    //methods to expose
    const start = function(){
        lastSwapAt = Date.now();
        lastSwapPosition = CATCH_BAR_INITIAL_POSITION;
        direction = "down";

        sendData(getData());
        swappedDirectionCallback();
        
    }

    const updateDirection = function(newDirection){
        lastSwapPosition = computeCatchBarCurrentPosition(direction, lastSwapAt, lastSwapPosition);
        direction = newDirection;
        lastSwapAt = Date.now();

        sendData(getData());
        swappedDirectionCallback();
    }

    const getInfo = function(){
        return { direction, lastSwapAt, lastSwapPosition };
    }

    const getData = function(){
        const data = {
            'type': 'catchBarInfo',
            'data': {
                lastSwapPosition,
                lastSwapAt,
                direction
            }
        }
        return data;
    }

    return {
        start, updateDirection, getInfo, getData
    };
}