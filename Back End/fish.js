import { sendData } from "./app.js";
import { computeFishCurrentPosition, computeFishTimeToNextSwap, FISH_MAX_POS } from "./public/globals.js";


export default function Fish(speed, swappedDirectionCallback){
    let lastSwapPosition;
    let lastSwapAt;
    let direction;

    let timeOutID = undefined;

    const start = () => {
        lastSwapPosition = Math.random() * FISH_MAX_POS;
        lastSwapAt = Date.now();
        direction = "down";

        sendData(getData());
        swappedDirectionCallback();

        const swapDirection = () => {
            timeOutID = setTimeout(() => {
                lastSwapPosition = computeFishCurrentPosition(direction, lastSwapAt, lastSwapPosition, speed);
                lastSwapAt = Date.now();
                direction = (direction === "up") ? "down" : "up";

                sendData(getData());
                swappedDirectionCallback();

                swapDirection();
            }, computeFishTimeToNextSwap(direction, lastSwapPosition, speed));
        }
        swapDirection();
    }

    const getInfo = () => {
        return { direction, lastSwapAt, lastSwapPosition };
    }

    const finish = () => {
        clearTimeout(timeOutID);
    }

    const getData = function(){
        const data = {
            'type': 'fishInfo',
            'data': {
                lastSwapPosition,
                lastSwapAt,
                direction, 
                speed
            }
        }
        return data;
    }

    return {
        start, getInfo, finish, getData
    };
}