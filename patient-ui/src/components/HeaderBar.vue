<template>
    <div id="navbar">
        <router-link id="title" to="/"> Dentago </router-link>
        <button> Notifications </button>
        <button class="btn" @click="redirect()"> Profile </button>
    </div>
</template>

<style scoped>
#navbar{
    display: flex;
    background-color: #FFA686;
    filter: drop-shadow(0px 2px 2px #000000);
    justify-content: space-evenly;
    padding: 1%;
}

#title{
    font-size: larger;
}
</style>

<script>
export default {
    data() {
        return {
            username: 'ratKing', // placeholder value
        }
    },
    methods: {
        redirect(){
            this.$router.push('/user/' + this.username);
        }
    }
}
</script>