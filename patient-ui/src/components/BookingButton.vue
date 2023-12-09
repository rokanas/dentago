<template>
    <button @click="redirect()"> here </button>
</template>

<script>
export default {
    props: {
        clinicId: String,
    },
    methods: {
        redirect(){
            this.$router.push('/book/' + this.clinicId)
        }
    }
}
</script>