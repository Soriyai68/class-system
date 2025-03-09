<template>
  <!-- ...existing code... -->
  <div v-if="activeCandidates.length" class="shortlist-container">
    <div class="flex justify-center">
      <h3
        class="flex justify-center rounded-3xl shadow-lg shadow-pink-300 p-2 bg-red-700 text-white mb-4"
        style="width: 250px"
      >
        Shortlisted Candidates
      </h3>
    </div>
    <ul>
      <li
        v-for="candidate in activeCandidates"
        :key="candidate._id"
        class="candidate-item"
      >
        <span class="candidate-name">{{ candidate.name }}</span>
        <span class="candidate-email">{{ candidate.email }}</span>
        <span class="candidate-phone">{{ candidate.phone }}</span>
        <span class="candidate-position">{{ candidate.positionName }}</span>
        <span
          class="candidate-status"
          :class="{ 'active-status': candidate.status === 'active' }"
        >
          {{ candidate.status }}
        </span>
      </li>
    </ul>
  </div>
  <!-- ...existing code... -->
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

export default {
  // ...existing code...
  data() {
    return {
      activeCandidates: [],
    };
  },
  created() {
    this.fetchActiveCandidates();
  },
  methods: {
    fetchActiveCandidates() {
      Meteor.call("fetchActiveCandidates", (error, result) => {
        if (error) {
          console.error("Failed to fetch active candidates:", error);
        } else {
          this.activeCandidates = result;
        }
      });
    },
  },
  // ...existing code...
};
</script>

<style>
.shortlist-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.candidate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.candidate-name {
  font-weight: bold;
}

.candidate-email {
  color: #777;
}

.candidate-phone {
  color: #777;
}

.candidate-position {
  color: #555;
}

.candidate-status {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.active-status {
  background-color: #4caf50;
  color: #fff;
}
</style>
