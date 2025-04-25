<template>
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
</template>

<script>
import { Meteor } from "meteor/meteor";

export default {
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
};
</script>
