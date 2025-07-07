<template>
  <!-- To send a prop to a child (parameter) you type the prop
  into the component for example: <Component chrono-label="Chrono1"/>-->

  <BaseBackground/>

  <BasePlayer 
  :state="playerState" 
  :captured-fish="fishId" 
  @animation-finished="enableButton" 
  @showing-caught-fish="showFish"/>

  <Hud 
  @set-player-state="changeState"
  @set-captured-fish="fishCaptured"
  :show-caught-fish-trigger="fishTrigger" 
  :enable-action-button-trigger="buttonTrigger" />

</template>

<script>
import BaseBackground from './base_components/BaseBackground.vue';
import BasePlayer from './base_components/BasePlayer.vue';
import Hud from './components/Hud.vue';

export default {
  name: "App",
  components: {
    BaseBackground,
    BasePlayer,
    Hud
  },
  data(){
    return {
      buttonTrigger: 0,
      fishTrigger: 0,
      playerState: "",
      fishId: ""
    }
  },
  methods: {
    enableButton(){
      if (!this.isButtonEnabled){
        // Every time the function is called (every time a player animation finishes), we activate the trigger by
        // increasing this aux variable that we send to the child as a prop
        this.buttonTrigger++;
      }
    },
    showFish(){
      if(!this.isFishShown){
        // Every time the function is called (the caught fish dialog must be displayed), we activate the trigger by
        // increasing this aux variable variable that we send to the child as a prop
        this.fishTrigger++;
      }
    },
    changeState(state){
      this.playerState = state;
    },
    fishCaptured(id){
      this.fishId = id;
    }
  }

};
</script>

<style>
img {
    -webkit-user-drag: none;
}
</style>
