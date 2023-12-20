<template>
    <div id="navbar">
        <button class="btn btn-link" @click="navigateTo('/')" data-toggle="tooltip" data-placement="bottom" title="Home">
            <span class="material-symbols-outlined">
                home
            </span>
        </button>
        <button class="btn btn-link" data-toggle="tooltip" data-placement="bottom" title="Notifications">
            <span v-if="notifications === null" class="material-symbols-outlined">
                notifications
            </span>
            <span v-else class="material-symbols-outlined">
                notifications_unread
            </span>
        </button>
        <button class="btn btn-link" @click="redirect()" data-toggle="tooltip" data-placement="bottom" title="Profile">
            <span class="material-symbols-outlined">
                account_circle
            </span>
        </button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: 'ratKing', // placeholder value
            notifications: null,
        }
    },
    methods: {
        navigateTo(route) {
            this.$router.push(route);
        },
        redirect() {
            this.$router.push('/user/' + this.username);
        }
    }
}
</script>

<style scoped>
.material-symbols-outlined {
  color: black;
  font-size: 1.8em; /* Adjust the size as needed */
  /* transition: transform 0.2s, color 0.2s; */
}

.material-symbols-outlined:hover {
  /* transform: scale(1.2); Adjust the scale factor as needed for the pop effect */
  color: #333; /* Darker shade of black for hover effect */
}
</style>