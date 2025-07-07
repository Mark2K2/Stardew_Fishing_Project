import { ATTEMPTS_DIFFICULTY, FISH_BIT_TIMEOUT_MS, PULL_ROD_TIMEOUT_MS } from "./public/globals.js";
import CatchingMinigame from "./catching_minigame.js";


export default function Game(){
    // Local variables
    let playerState = "standing"; // "standing", "line_cast", "fish_bit" or "playing_minigame"
    let attemptNumber = 0; // current catching attempt
    let catchingMinigame = CatchingMinigame(() => {
        playerState = "standing";
    });

    let fishBitTimerID = undefined;
    let fishScapeTimerID = undefined;
    let selectedDifficulty = undefined;

    let waitForBiteResolve = null;
    let waitForBiteReject = null;

    // Methods to expose
    const castLine = () => {
        if(playerState !== "standing"){ return playerState; }

        playerState = "line_cast";

        fishBitTimerID = setTimeout(() => {
            playerState = "fish_bit"

            waitForBiteResolve();

            fishScapeTimerID = setTimeout(_ => {
                playerState = "standing";
            },PULL_ROD_TIMEOUT_MS);
        }, FISH_BIT_TIMEOUT_MS);
        return null;
    }

    const waitForBite = () => { 
        // create a promise that resolve just when the fish takes the bait
        // reject passing playerState as the error code otherwise
        return new Promise((resolve, reject) => {
            if(playerState !== "line_cast"){
                reject(playerState);
            } else{
                waitForBiteResolve = resolve;
                waitForBiteReject = reject;
            }
        });
    }

    const reelIn = () => {
        if(playerState !== "fish_bit"){
            if(playerState === "playing_minigame") { return {errorCode: playerState} }
            else{
                playerState = "standing";

                waitForBiteReject(playerState);

                clearTimeout(fishBitTimerID);
                clearTimeout(fishScapeTimerID);

                return {errorCode: playerState};
            }
        }else{
            playerState = "playing_minigame";
            clearTimeout(fishBitTimerID);
            clearTimeout(fishScapeTimerID);

            selectedDifficulty = ATTEMPTS_DIFFICULTY[attemptNumber];
            attemptNumber = (attemptNumber + 1) % ATTEMPTS_DIFFICULTY.length;

            catchingMinigame.start(selectedDifficulty);

            return {difficulty: selectedDifficulty};
        }
    }

    const updateCatchBarDirection = catchingMinigame.updateCatchBarDirection;

    const getCatchingMinigameInfo = () => {
        return catchingMinigame.getInfo();
    };

    const getCatchingMinigameData = () => {
        return catchingMinigame.getData();
    }

    return {
        castLine, waitForBite, reelIn, updateCatchBarDirection, getCatchingMinigameInfo, getCatchingMinigameData
    };
}