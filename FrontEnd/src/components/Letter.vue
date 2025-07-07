<template>
    <BaseLetter 
    :character="this.character"
    :x="calculateProps.BoundsInTexture.X" 
    :y="calculateProps.BoundsInTexture.Y" 
    :width="calculateProps.BoundsInTexture.Width" 
    :height="calculateProps.BoundsInTexture.Height" 
    :verticalOffset="calculateProps.Cropping.Y"/>
</template>

<script>
import BaseLetter from '@/base_components/BaseLetter.vue';
import SmallFont from '../assets/SmallFont.json'

export default {
    name: "Letter",
    props: {
        character: {
            type: String,
            required: true
        }
    },
    components: {
        BaseLetter
    },
    data() {
        return {
            x: 0, y: 0, width: 0, height: 0, verticalOffset: 0
        }
    },
    computed:{
        calculateProps(){
            // when you import SmallFont it automatically returns json file parsed as an object            
            return SmallFont.Glyphs[this.character];
        }
    }
}
</script>