import CatchBar from "./catch_bar.js";
import Fish from "./fish.js";
import ProgressBar from "./progress_bar.js";
import { DIFFICULTY_TO_FISH_SPEED } from "./public/globals.js";


export default function CatchingMinigame(finishCallback){
    // Local variables
    let progressBar = undefined;
    let catchBar = undefined;
    let fish = undefined;

    // Methods to expose
    const start = (difficulty) => {
        // Set the initial values with their corresponding cb's
        let fishSpeed = DIFFICULTY_TO_FISH_SPEED[difficulty];

        progressBar = ProgressBar(fishSpeed, () => {
            fish.finish();
            finishCallback();
        });
        catchBar = CatchBar(() => {
            const catchBarInfo = catchBar.getInfo();
            progressBar.catchBarSwappedDirection(catchBarInfo.direction, catchBarInfo.lastSwapAt, catchBarInfo.lastSwapPosition);
        });
        fish = Fish(fishSpeed, () => {
            const fishInfo = fish.getInfo();
            progressBar.fishSwappedDirection(fishInfo.direction, fishInfo.lastSwapAt, fishInfo.lastSwapPosition);
        });

        // Call the start methods
        progressBar.start();
        catchBar.start();
        fish.start();
    }

    const getInfo = () => {
        const progressBarInfo = progressBar.getInfo();
        const catchBarInfo = catchBar.getInfo();
        const fishInfo = fish.getInfo();

        return { progressBarInfo, catchBarInfo, fishInfo };
    }

    const getData = () => {
        const progressBarData = progressBar.getData();
        const catchBarData = catchBar.getData();
        const fishData = fish.getData();

        return { progressBarData, catchBarData, fishData };
    }

    const updateCatchBarDirection = (newDirection) => {
        return catchBar.updateDirection(newDirection);
    }

    return {
        start, getInfo, updateCatchBarDirection, getData
    };
}