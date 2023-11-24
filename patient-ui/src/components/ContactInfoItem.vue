<template>
    <div>
        <img :src=img_src>
        {{text}}
    </div>
</template>

<script>
export default {
    props: {
        img_src: String,
        text: String
    }
}
</script>
