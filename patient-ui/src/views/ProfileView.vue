<template>
    <div>
        <HeaderBar></HeaderBar>

        <h1> Profile page yahooooooooooooooooooooooooooo! </h1>

        <p> This is for user {{ username }}</p>
    </div>
</template>

<script>
import HeaderBar from '@/components/HeaderBar.vue'

export default {
    components: {
        HeaderBar
    },
    props: {
        username: String
    }
}
</script>
