<template>
    <Minigame 
    @finished="minigameFinished" 
    :visible="isMinigameVisible" 
    :difficulty="difficulty"
    />

    <BaseCaptures>
        <BaseAttempt 
        v-for="(attempt, index) in this.attempts"
        :key="index"
        :difficulty="attempt.difficulty" 
        :successful="attempt.successful"/>
    </BaseCaptures>
    
    
    <BaseYellowIndicator 
    :show-trigger="yellowIndicatorTrigger"/> <!-- triggered when the wait_for_bite endpoint call has responded successfully -->
    


    <BaseActionButton 
    :text="actionButtonText" 
    :disabled="buttonDisabled" 
    @click="buttonClicked" 
    @pressed="buttonPressed" 
    @released="buttonReleased"/>

    <CaughtFishDialog v-if="fishDialogVisible" 
    :difficulty="difficulty"/>
</template>

<script>
import Minigame from './Minigame.vue';
import BaseCaptures from '../base_components/BaseCaptures.vue';
import CaughtFishDialog from './CaughtFishDialog.vue'
import BaseYellowIndicator from '@/base_components/BaseYellowIndicator.vue';
import BaseActionButton from '@/base_components/BaseActionButton.vue';
import { ATTEMPTS_DIFFICULTY, DIFFICULTY_TO_FISH_TYPE, PULL_ROD_TIMEOUT_MS } from '../../public/globals';
import BaseAttempt from '@/base_components/BaseAttempt.vue';

export default {
    name: "Hud",
    emits: ['setPlayerState', 'setCapturedFish'],
    props: {
        showCaughtFishTrigger: { // trigger informing Hud component that it must display the caught fish dialog
            type: Number,
            required: true
        },
        enableActionButtonTrigger: { // trigger informing Hud component that it must enable the action button
            type: Number,
            required: true
        }
    }, 
    data() {
        return {
            attempts: [], // array containing a dictionary in each slot: {difficulty: "", successful: ""}
            attempt: 0,
            isMinigameVisible: false,
            actionButtonText: "cast",
            buttonDisabled: false,
            fishDialogVisible: false,
            yellowIndicatorTrigger: 0,
            difficulty: ''
        }
    },
    components: {
        Minigame, // Manages the minigame
        // Manages the row of minigame attempts at the top of the screen,
        // contains a slot, which you must use to display a list of BaseAttempt base components using the variable attempts
        BaseCaptures,
        // Manages the dialog that displays the captured fish,
        // displayed with v-if only if the prop showCaughtFishTrigger has been triggered
        CaughtFishDialog,
        BaseYellowIndicator, // Manages the yellow indicator that indicates when the fish has taken the bait
        BaseActionButton, // Manages the action button at the bottom of the screen
        BaseAttempt
    },
    watch: {
        showCaughtFishTrigger(){
            this.fishDialogVisible = true;
        },
        enableActionButtonTrigger(){
            this.buttonDisabled = false;
        }
    },
    methods: {
        minigameFinished(captured){
            this.isMinigameVisible = false;
            this.$emit("setPlayerState", "reeling_in")
            if (captured){
                this.$emit("setCapturedFish", DIFFICULTY_TO_FISH_TYPE[this.difficulty]);
            }else{
                this.$emit("setCapturedFish", "");
            }
            this.actionButtonText = "cast";
            this.buttonDisabled = true;

            this.attempts.push({difficulty: this.difficulty, successful: captured});
            this.attempt = (this.attempt + 1) % ATTEMPTS_DIFFICULTY.length;
            if (this.attempts.length === ATTEMPTS_DIFFICULTY.length){
                this.actionButtonText = "retry";
            }
        },
        buttonClicked(){
            if (this.isMinigameVisible || this.buttonDisabled){
                return;
            }
            switch(this.actionButtonText){
                case "cast":
                    if (this.fishDialogVisible){this.fishDialogVisible = false;}
                    fetch('http://localhost:8081/cast_line')
                    .then(res => {
                        if(res.ok){
                            console.log('cast_line endpoint success')
                            this.$emit("setPlayerState", "casting");
                            this.actionButtonText = "start";
                            this.buttonDisabled = true;
                            fetch('http://localhost:8081/wait_for_bite')
                            .then(res => {
                                if (res.ok){
                                    console.log('wait for bite endpoint success')
                                    this.yellowIndicatorTrigger++;
                                    setTimeout(_ => {
                                        if(!this.isMinigameVisible){
                                            this.$emit('setPlayerState', 'reeling_in');
                                            this.$emit('setCapturedFish', '');
                                            this.actionButtonText = 'cast';
                                            this.buttonDisabled = true;
                                        }
                                    }, PULL_ROD_TIMEOUT_MS);
                                }else{
                                    console.log('Error in wait_for_bite endpoint: probably didnt wait enough')
                                }
                            })
                        }else{
                            console.log('Error in cast_line endpoint')
                        }
                    })
                    break;
                case "start":
                    fetch('http://localhost:8081/reel_in')
                    .then(res => {
                        res.json()
                        .then(data => {
                            if(data.errorCode){ // 'standing'
                                this.$emit('setPlayerState', 'reeling_in');
                                this.$emit('setCapturedFish', '');
                                this.actionButtonText = 'cast';
                                this.buttonDisabled = true;
                            }else{ //data = { difficulty: value}
                                this.$emit('setPlayerState', 'playing');
                                this.isMinigameVisible = true;
                                this.difficulty = data.difficulty;
                                this.actionButtonText = 'pull';
                            }
                        })
                    })
                    break;
                case "retry":
                    if (this.fishDialogVisible){this.fishDialogVisible = false;}
                    this.attempts = [];
                    this.attempt = 0;
                    this.$emit("setCapturedFish", "");
                    this.actionButtonText = "cast";
                    break;
            }
        },
        buttonPressed(){
            if (this.isMinigameVisible){
                fetch('http://localhost:8081/move_catch_bar_up')
                .then(res => {
                    if(!res.ok){
                        console.log('error in move catch bar up endpoint')
                    }
                })
            }
        },
        buttonReleased(){
            if (this.isMinigameVisible){
                fetch('http://localhost:8081/stop_moving_catch_bar_up')
                .then(res => {
                    if(!res.ok){
                        console.log('error in stop moving catch bar up endpoint');                        
                    }
                })
            }
        }
    }
}
</script>