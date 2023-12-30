<template>
    <div id="footer">
        <ContactInfoItem img_src="../../src/assets/email_material_icon.png" text="dentago@gmail.com"></ContactInfoItem>

        <ContactInfoItem img_src="../../src/assets/phone_material_icon.png" text="+461234567890"></ContactInfoItem>

        <ContactInfoItem img_src="../../src/assets/twitter_icon.png" text="@dentago"></ContactInfoItem>
    </div>
</template>

<script>
import ContactInfoItem from '@/components/ContactInfoItem.vue';

export default {
    components: {
        ContactInfoItem,
    },
}

</script>