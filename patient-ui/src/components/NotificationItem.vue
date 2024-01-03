<template>
  <div class="card mb-2">
    <div class="card-body">
      <h5 class="card-title text-primary">{{ category }}</h5>
      <p class="card-text">{{ message }}</p>
      <p>For the following timeslots:</p>
      <ul class="list-group list-group-flush">
        <li class="list-group-item" v-for="timeslot in timeslots" :key="timeslot">
          <a href="#" class="card-link">{{ timeslot }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.card-title {
  margin-bottom: 0.5rem;
}

.card-text {
  margin-bottom: 0.75rem;
}

.card-link {
  color: #0d6efd;
}

.card-link:hover {
  text-decoration: none;
  color: #024c8c;
}

.list-group-item {
  border: 0 none;
  padding-left: 0;
}

.list-group-item:not(:last-child) {
  margin-bottom: 0.5rem;
}

.card:hover {
  transform: scale(1.02);
}
</style>

<script>
export default {
  props: {
    category: String,
    message: String,
    timeslots: Array
  }
}
</script>
