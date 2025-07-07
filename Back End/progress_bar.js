import { catchBarAndFishTouch, computeCatchBarCurrentPosition, computeFishCurrentPosition, computeProgressBarCurrentPosition, PROGRESS_BAR_INITIAL_POSITION, PROGRESS_BAR_TICK_FREQUENCY, timeForProgressBarToReachLimit } from "./public/globals.js";
import { sendData } from "./app.js";

export default function ProgressBar(fishSpeed, finishCallback)
{
    // Progress Bar (local variables)
    let lastSwapPosition;
    let lastSwapAt;
    let direction;
    let state;

    // Timers
    let t1;
    let t2;

    // Fish
    let fishLastSwapPosition;
    let fishLastSwapAt;
    let fishDirection;
    
    // CatchBar
    let catchBarLastSwapPosition;
    let catchBarLastSwapAt;
    let catchBarDirection;

    // Timer T1
    const startT1 = () => {
        t1 = setTimeout(() => {
            state = (direction === "up") ? "successful" : "failed";
            if (t2) { clearInterval(t2); }
            sendData(getData());
            finishCallback();
        }, timeForProgressBarToReachLimit(direction, lastSwapPosition));
    }

    // Methods to expose
    const start = () => {
        lastSwapPosition = PROGRESS_BAR_INITIAL_POSITION;
        lastSwapAt = Date.now();
        direction = "down";
        state = "in_progress";
        
        sendData(getData());
        startT1();

        t2 = setInterval(() => {
            // Compute their current position
            const fishPosition = computeFishCurrentPosition(fishDirection, fishLastSwapAt, fishLastSwapPosition, fishSpeed);
            const catchBarPosition = computeCatchBarCurrentPosition(catchBarDirection,catchBarLastSwapAt, catchBarLastSwapPosition);

            if((direction === "down" && catchBarAndFishTouch(fishPosition, catchBarPosition)) 
                || (direction === "up" && !catchBarAndFishTouch(fishPosition, catchBarPosition))){

                lastSwapPosition = computeProgressBarCurrentPosition(direction, lastSwapAt, lastSwapPosition);
                direction = (direction === "up") ? "down" : "up";
                lastSwapAt = Date.now();
                sendData(getData());

                if (t1) { clearTimeout(t1); }
                startT1();
            }
        }, PROGRESS_BAR_TICK_FREQUENCY);
    }

    const fishSwappedDirection = (a, b, c) => {
        fishDirection = a;
        fishLastSwapAt = b;
        fishLastSwapPosition = c;
    }

    const catchBarSwappedDirection = (a, b, c) => {
        catchBarDirection = a;
        catchBarLastSwapAt = b;
        catchBarLastSwapPosition = c;
    }

    const getInfo = () => {
        return { direction, lastSwapAt, lastSwapPosition, state };
    }

    const getData = function(){
        const data = {
            'type': 'progressBarInfo',
            'data': {
                lastSwapPosition,
                lastSwapAt,
                direction,
                state
            }
        }
        return data;
    }

    return {
        start, fishSwappedDirection, catchBarSwappedDirection, getInfo, getData
    };
}