<template>
<<<<<<< HEAD
  <div v-if="activeCandidates.length" class="container mx-auto mt-8">
    <div class="shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr class="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
            <th class="py-3 px-4 text-left md:px-6">#</th>
            <th class="py-3 px-4 text-left md:px-6">Candidate Name</th>
            <th class="py-3 px-4 text-left hidden sm:table-cell md:px-6">Email</th>
            <th class="py-3 px-4 text-left hidden sm:table-cell md:px-6">Phone</th>
            <th class="py-3 px-4 text-left md:px-6">Position</th>
            <th class="py-3 px-4 text-left md:px-6">Status</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr
            v-for="(candidate, index) in activeCandidates"
            :key="candidate._id"
            class="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
          >
            <td class="py-3 px-4 text-left md:px-6">{{ index + 1 }}</td>
            <td class="py-3 px-4 text-left md:px-6">{{ candidate.name }}</td>
            <td class="py-3 px-4 text-left hidden sm:table-cell md:px-6">{{ candidate.email }}</td>
            <td class="py-3 px-4 text-left hidden sm:table-cell md:px-6">{{ candidate.phone }}</td>
            <td class="py-3 px-4 text-left md:px-6">{{ candidate.positionName }}</td>
            <td class="py-3 px-4 text-left md:px-6">
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="{
                  'bg-green-100 text-green-700': candidate.status === 'active',
                  'bg-red-100 text-red-700': candidate.status !== 'active',
                }"
              >
                {{ candidate.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="container mx-auto mt-8">
    <p class="text-gray-500 text-center">No active candidates found.</p>
  </div>
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
</template>

<script>
import { Meteor } from "meteor/meteor";
<<<<<<< HEAD

export default {
=======
import { Tracker } from "meteor/tracker";

export default {
  // ...existing code...
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
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
<<<<<<< HEAD
};
</script>
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
