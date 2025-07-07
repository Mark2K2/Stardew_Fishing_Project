<template>
    <BaseCaughtFishDialog 
    :fishType="fishType">
        <template v-slot:fishName>
            <Sentence 
            :text="fishName"/> <!-- Name of the captured fish -->
        </template>

        <template v-slot:fishInchesLabel>
            <Sentence 
            :text="'Lenght:'"/>
        </template>

        <template v-slot:fishInches>
            <Sentence 
            :text="inches"/>
        </template>
    </BaseCaughtFishDialog>
</template>

<script>
import BaseCaughtFishDialog from '@/base_components/BaseCaughtFishDialog.vue';
import Sentence from './Sentence.vue';
import { DIFFICULTY_TO_FISH_MAX_LENGTH, DIFFICULTY_TO_FISH_MIN_LENGTH, DIFFICULTY_TO_FISH_NAME, DIFFICULTY_TO_FISH_TYPE } from '../../public/globals';

export default {
    name: "CaughtFishDialog",
    components: {
        BaseCaughtFishDialog,
        Sentence
    },
    props: {
        difficulty: {
            type: String,
            required: true
        }
    },
    computed: {
        inches(){
            const min = DIFFICULTY_TO_FISH_MIN_LENGTH[this.difficulty];
            const max = DIFFICULTY_TO_FISH_MAX_LENGTH[this.difficulty];
            const lenght = this.getRandomIntInclusive(min, max);

            return `${lenght} in.`;
        },
        fishType() {
            return DIFFICULTY_TO_FISH_TYPE[this.difficulty];
        },
        fishName(){
            return DIFFICULTY_TO_FISH_NAME[this.difficulty];
        }
    },
    methods:{
        getRandomIntInclusive(min, max) {
            const minCeiled = Math.ceil(min);
            const maxFloored = Math.floor(max);

            return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
        }
    },
}
</script>