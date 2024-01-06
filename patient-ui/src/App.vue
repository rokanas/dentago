<script>
import HeaderBar from '@/components/HeaderBar.vue';
import { RouterView } from 'vue-router';
import FooterBar from '@/components/FooterBar.vue';

export default {
    components: {
        HeaderBar,
        RouterView,
        FooterBar
    }
}
</script>

<template>
  <div>
    <HeaderBar />
    <RouterView />
    <FooterBar />
  </div>
</template>
