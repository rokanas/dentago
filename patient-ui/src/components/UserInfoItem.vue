<template>
    <div>
        <div class="user-info">
            <button v-if="!showForm" class="btn btn-info" @click="showForm = true">
                Edit User Info
            </button>
            <transition name="fade">
                <form v-if="showForm" @submit.prevent="submitForm">
                    <div class="form-group">
                        <label for="userFirstName">First Name</label>
                        <input class="form-control" v-model="userInfoTemp.firstName" type="text" id="userFirstName"
                            :placeholder="userInfo['firstName']">
                    </div>
                    <div class="form-group">
                        <label for="userLastName">Last Name</label>
                        <input class="form-control" v-model="userInfoTemp.lastName" type="text" id="userLastName"
                            :placeholder="userInfo['lastName']">
                    </div>
                    <div class="form-group">
                        <label for="userContactInfo">Contact</label>
                        <input class="form-control" v-model="userInfoTemp.contactInfo" id="userContactInfo"
                            :placeholder="userInfo['contactInfo']">
                    </div>
                    <div class="form-check">
                        <input type="checkbox" v-model="isCheckboxSelected" class="form-check-input" id="exampleCheck1">
                        <label class="form-check-label" for="exampleCheck1">Update information</label>
                    </div>
                    <button v-if="!isCheckboxSelected" class="btn btn-danger">Cancel</button>
                    <button v-else type="submit" class="btn btn-primary">Submit</button>
                </form>
            </transition>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        userInfo: Object
    },
    methods: {
        toggleEdit() {
            if (this.isEditing) {
                // Check if any field has changed
                if (
                    this.userInfoTemp.firstName !== this.userInfo.firstName ||
                    this.userInfoTemp.lastName !== this.userInfo.lastName ||
                    this.userInfoTemp.contactInfo !== this.userInfo.contactInfo
                ) {
                    // TODO: Update data here
                    console.log('UPDATE');
                }
            }
            this.isEditing = !this.isEditing;
        },
        submitForm() {
            if (this.isCheckboxSelected) {
                console.log('Form submitted');
            }
            else {
                console.log('Cancelled');
            }
            this.showForm = false; // Hide the form after submission
        }
    },
    data() {
        return {
            userInfoTemp: { firstName: '', lastName: '', contactInfo: '' },
            isCheckboxSelected: false,
            isEditing: false,
            showForm: false,
        };
    },
    created() {
        this.userInfoTemp = { ... this.userInfo };
    },
}

</script>

<style scoped>
label {
    margin-right: 1em;
}

.custom-input {
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1em;
    margin-bottom: 0.5em;
}

.form-group {
    padding: 0.5em;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0.5;
}</style>
