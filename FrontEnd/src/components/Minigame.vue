<template>
    <BaseMinigame
    :visible="visible" 
    :spoolRotationType="rotation">
        <BaseCatchBar 
        :direction="catchBarDirection" 
        :lastSwapAt="catchBarLastSwapAt" 
        :lastSwapPosition="catchBarLastSwapPosition"/>
        <BaseFish 
        :direction="fishDirection" 
        :lastSwapAt="fishLastSwapAt" 
        :lastSwapPosition="fishLastSwapPosition"
        :speed="fishSpeed"
        :isLegend="isLegend"/>
        <BaseProgressBar 
        :direction="progressBarDirection" 
        :lastSwapAt="progressBarLastSwapAt" 
        :lastSwapPosition="progressBarLastSwapPosition"/>
    </BaseMinigame>
</template>

<script>
import BaseCatchBar from '@/base_components/BaseCatchBar.vue';
import BaseMinigame from '../base_components/BaseMinigame.vue';
import BaseFish from '@/base_components/BaseFish.vue';
import BaseProgressBar from '@/base_components/BaseProgressBar.vue';
import { DIFFICULTY_TO_FISH_SPEED } from '../../public/globals';


export default {
    name: "Minigame",
    emits: ['finished'],
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        difficulty: {
            type: String,
            required: true
        }
    },
    components: {
        BaseMinigame,
        BaseCatchBar,
        BaseFish,
        BaseProgressBar
    },
    data() {
        return {
            rotation: 'clockwise',
            wsConnection: false,
            catchBarDirection: '',
            catchBarLastSwapAt: 0,
            catchBarLastSwapPosition:0,
            fishDirection: '',
            fishLastSwapAt: 0,
            fishLastSwapPosition: 0,
            progressBarDirection: '',
            progressBarLastSwapAt: 0,
            progressBarLastSwapPosition: 0,
            getInfoInterval: null,
            finished: false,
            fishSpeed: 0,
            isLegend: false,
            ws: null
        }
    },
    mounted(){
        if(this.ws) return

        this.ws = new WebSocket('ws://localhost:8080');

        this.ws.addEventListener('open', () => {
            console.log('WebSocket conectado');
        })

        this.ws.addEventListener('message', event => {
            const data = JSON.parse(event.data);
            const type = data.type;
            const info = data.data;

            switch(type){
                case 'progressBarInfo':
                    this.processProgressBarInfo(info);
                    // change the rotation
                    if(info.direction === 'up'){
                        this.rotation = 'clockwise';
                    }else{
                        this.rotation = 'anticlockwise';
                    }
                    // check if we have finished or not
                    if(info.state === 'successful'){ this.$emit("finished", true); }
                    if(info.state === 'failed'){ this.$emit("finished", false); }
                break;
                case 'catchBarInfo':
                    this.processCatchBarInfo(info);
                    //console.log(data.type.data); undefined
                break;
                case 'fishInfo':
                    this.processFishInfo(info);
                    //console.log(data.type.data); undefined
                break;
            }
        })

        this.ws.addEventListener('error', err => {
            console.error('WebSocket error', err);
        })

        this.ws.addEventListener('close', () => {
            console.log('Minigame WS desconectado');
            this.ws = null;
        })
    },
    beforeUnmount(){
        if(this.getInfoInterval){
            clearInterval(this.getInfoInterval);
            this.getInfoInterval = null;
        }
        if(this.ws){
            this.ws.close();
            this.ws = null;
        }
    },
    watch: {
        visible(newVal){
            if (newVal){
                this.finished = false;
                if (this.getInfoInterval) {clearInterval(this.getInfoInterval);}
                if(!this.ws){ this.getInfoInterval = setInterval(this.fetchMinigameInfo, 50); }
            }else{
                if(this.getInfoInterval){
                    clearInterval(this.getInfoInterval);
                    this.getInfoInterval = null;
                }
            }
        },
        difficulty(newVal){
            this.fishSpeed = DIFFICULTY_TO_FISH_SPEED[newVal];
            if(newVal === 'legend'){ this.isLegend = true; }
        }
    },
    methods: {
        fetchMinigameInfo(){
            fetch('http://localhost:8081/get_mini_game_info')
            .then(res => {
                if(res.ok){
                    console.log('Getting mini game info successfully');
                    res.json()
                    .then(data => {
                        this.processCatchBarInfo(data.catchBarInfo);
                        console.log(data.catchBarInfo);
                        this.processFishInfo(data.fishInfo);
                        console.log(data.fishInfo);
                        //change the rotation
                        if (data.progressBarInfo.direction === 'up'){
                            this.rotation = 'clockwise';
                        }else{
                            this.rotation = 'anticlockwise'
                        }
                        switch(data.progressBarInfo.state){
                            case 'in_progress':
                                this.processProgressBarInfo(data.progressBarInfo);
                                console.log(data.progressBarInfo);
                            break;
                            case 'successful':
                                if(!this.finished){
                                    this.$emit("finished", true);
                                    this.finished = true;
                                    console.log(data.progressBarInfo);
                                    clearInterval(this.getInfoInterval);
                                    this.getInfoInterval = null;
                                }
                            break;
                            case 'failed':
                                if(!this.finished){
                                    this.finished = true;
                                    this.$emit("finished", false);      
                                    console.log(data.progressBarInfo);
                                    clearInterval(this.getInfoInterval);
                                    this.getInfoInterval = null;
                                }
                            break;
                        }
                    })
                }
                else{
                    console.log('error in getting mini game info');
                }
            })
        },
        processCatchBarInfo(catchBarInfo){ // dictionary
            this.catchBarDirection = catchBarInfo.direction;
            this.catchBarLastSwapAt = catchBarInfo.lastSwapAt;
            this.catchBarLastSwapPosition = catchBarInfo.lastSwapPosition;
        },
        processFishInfo(fishInfo){ // dictionary
            this.fishDirection = fishInfo.direction;
            this.fishLastSwapAt = fishInfo.lastSwapAt;
            this.fishLastSwapPosition = fishInfo.lastSwapPosition;
        },
        processProgressBarInfo(progressBarInfo){ // dictionary
            this.progressBarDirection = progressBarInfo.direction;
            this.progressBarLastSwapAt = progressBarInfo.lastSwapAt;
            this.progressBarLastSwapPosition = progressBarInfo.lastSwapPosition;
        }
    }
}
</script>