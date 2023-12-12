<template>
    <div id="notif">
        <div id="title"> {{ title }} </div>
        <div id="description"> {{ description }} </div>
        <br>
    </div>
</template>

<style>
#notif {
    border: 12px;
}

#title {
    font-weight: bold;
    font-size: large;
}
</style>

<script>
export default {
    props: {
        title: String,
        description: String
    }
}
</script>