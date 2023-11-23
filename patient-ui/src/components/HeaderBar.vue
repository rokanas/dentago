<template>
    <div id="navbar">
        <p id="title"> Header Bar </p>
        <button> Notifications </button>
        <button> Profile </button>
    </div>
</template>

<style scoped>
#navbar{
    display: flex;
    background-color: violet;
    filter: drop-shadow(0px 2px 2px #000000);
    justify-content: space-evenly;
}

#title{
    font-size: larger;
}
</style>