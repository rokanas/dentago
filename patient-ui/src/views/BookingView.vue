<template>
    <div>
        <HeaderBar></HeaderBar>

        <h1> Clinic id = {{ clinicId }}</h1>
    </div>
</template>

<script>
import HeaderBar from '@/components/HeaderBar.vue'

export default {
    components: {
        HeaderBar
    },
    props: {
        clinicId: String
    }
}
</script>