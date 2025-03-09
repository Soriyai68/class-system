<template>
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
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
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
</script>
