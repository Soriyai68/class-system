<template>
<<<<<<< HEAD
  <div class="p-4">
    <!-- <button
      @click="fetchPassedCandidates"
      class="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 mb-4"
    >
      Click Candidates
    </button> -->

    <div class="shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr class="bg-gradient-to-r from-gray-100 to-gray-200 uppercase text-sm font-semibold text-gray-600">
            <th class="py-3 px-6 text-left">#</th>
            <th class="py-3 px-6 text-left">Candidate Name</th>
            <th class="py-3 px-6 text-left">Email</th>
            <th class="py-3 px-6 text-left">Phone</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr
            v-for="(candidate, index) in passedCandidates"
            :key="candidate._id"
            class="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
          >
            <td class="py-3 px-6 text-left">{{ index + 1 }}</td>
            <td class="py-3 px-6 text-left">{{ candidate.name }}</td>
            <td class="py-3 px-6 text-left">{{ candidate.email }}</td>
            <td class="py-3 px-6 text-left">{{ candidate.phone }}</td>
          </tr>
        </tbody>
      </table>
    </div>
=======
  <div>
    <el-button type="" plain @click="fetchPassedCandidates" class="mb-4">
      Click Candidates
    </el-button>

    <el-table
      :data="passedCandidates"
      style="width: 100%"
      border
      stripe

      class="modern-table"
      v-loading="loading"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="name" label="Candidate Name" />
      <el-table-column prop="email" label="Email" />
      <el-table-column prop="phone" label="Phone" />
    </el-table>
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
  </div>
</template>

<script lang="ts" setup>
<<<<<<< HEAD
import { ref, onMounted } from "vue";
=======
import { ref } from "vue";
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
import { Meteor } from "meteor/meteor";
import { ElNotification } from "element-plus";

// Define interfaces for type safety
interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const passedCandidates = ref<Candidate[]>([]);
const loading = ref(false);

// Fetch candidates who passed the interview
function fetchPassedCandidates() {
  loading.value = true;
  Meteor.call("fetchPassedCandidates", (error: any, result: Candidate[]) => {
    if (error) {
      ElNotification.error({
        title: "Error",
        message: error.message || "Failed to fetch passed candidates.",
      });
    } else {
      passedCandidates.value = result;
    }
    loading.value = false;
  });
}
<<<<<<< HEAD

// Automatically fetch candidates when the component is mounted
onMounted(() => {
  fetchPassedCandidates();
});
</script>

<style scoped>
/* Add any additional styles here if needed */
</style>
=======
</script>
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
