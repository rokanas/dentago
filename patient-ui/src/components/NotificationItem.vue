<template>
    <div id="notif">
        <div id="category"> {{ category }} </div>
        <div id="message"> {{ message }} </div>
        For the following timeslots:
        <div id="timeslots" v-for="timeslot in timeslots" :key="timeslot">
            <a href="">{{ timeslot }}</a>
        </div>
        <br>
    </div>
</template>

<style>
#notif {
    border: 12px;
}

#category {
    font-weight: bold;
    font-size: large;
}
</style>

<script>
export default {
    props: {
        category: String,
        message: String,
        timeslots: Array,
    }
}
</script>