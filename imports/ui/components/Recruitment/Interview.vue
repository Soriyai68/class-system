<template>
  <div>
    <!-- Manage Interview Button -->
    <el-button type="info" plain @click="openInterviewDialog" class="mb-4">
      Manage Interview
    </el-button>

    <!-- Interview Dialog -->
    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Interview' : 'Add Interview'"
      width="500px"
      align-center 
      :close-on-click-modal="true"
    >
      <el-form
        :model="form"
        ref="refForm"
        :rules="rules"
        label-width="120px"
        size="default"
        v-loading="loadingForm"
      >
        <el-form-item label="Candidate" prop="candidate_id">
          <el-select v-model="form.candidate_id" placeholder="Select candidate">
            <el-option
              v-for="candidate in activeCandidates"
              :key="candidate._id"
              :label="candidate.name"
              :value="candidate._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Interview Date" prop="interview_date">
          <el-date-picker
            v-model="form.interview_date"
            type="date"
            placeholder="Select interview date"
          />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Select status" @change="onStatusChange">
            <el-option label="Scheduled" value="scheduled" />
            <el-option label="Completed" value="completed" />
            <el-option label="Cancelled" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="Result" prop="result">
          <el-select v-model="form.result" placeholder="Select result" :disabled="isResultDisabled">
            <el-option label="Pass" value="pass" v-if="form.status === 'completed'" />
            <el-option label="Fail" value="fail" v-if="form.status === 'completed' || form.status === 'cancelled'" />
            <el-option label="Interviewing" value="interviewing" v-if="form.status === 'scheduled'" />
          </el-select>
        </el-form-item>
        <el-form-item label="Notes" prop="notes">
          <el-input
            v-model="form.notes"
            placeholder="Enter notes"
            type="textarea"
          />
        </el-form-item>
      </el-form>

      <el-form-item>
        <div class="flex justify-between space-x-2">
          <el-button
            type="primary"
            :loading="loadingForm"
            @click="onSubmit"
            class="w-28"
          >
            {{ form._id ? "Update" : "Add" }}
          </el-button>
          <el-button
            v-if="form._id"
            type="danger"
            plain
            @click="removeInterview"
            class="w-28"
          >
            Delete
          </el-button>
          <el-button @click="resetForm" class="w-28">Reset</el-button>
        </div>
      </el-form-item>
    </el-dialog>

    <!-- Interviews Table -->
    <el-table
      :data="filteredTableData"
      style="width: 100%"
      border
      stripe
      class="modern-table"
      v-loading="loading"
      :row-class-name="tableRowClassName"
    >
      <el-table-column type="index" label="#" width="60" />
      <!-- Display candidate name instead of ID -->
      <el-table-column label="Candidate">
        <template #default="scope">
          {{ getCandidateName(scope.row.candidate_id) }}
        </template>
      </el-table-column>
      <el-table-column label="Interview Date">
        <template #default="scope">
          {{ formatDate(scope.row.interview_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" />

      <!-- Result column with conditional text color -->
      <el-table-column label="Result" prop="result">
        <template #default="scope">
          <span :class="{'text-success': scope.row.result === 'pass', 'text-danger': scope.row.result === 'fail', 'text-warning': scope.row.result === 'interviewing'}">
            {{ scope.row.result }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="notes" label="Notes" />

      <!-- Actions Column -->
      <el-table-column label="Actions">
        <template #header>
          <el-input
            v-model="searchQuery"
            size="small"
            placeholder="Search actions"
            clearable
            @input="filterActions"
          />
        </template>
        <template #default="scope">
          <el-button
            v-if="matchesActionSearch(scope.row)"
            size="small"
            type="info"
            plain
            @click="editInterview(scope.row)"
          >
            Edit
          </el-button>
          <el-button
            v-if="matchesActionSearch(scope.row)"
            size="small"
            plain
            type="danger"
            @click="confirmDelete(scope.row)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { Meteor } from "meteor/meteor";
import { ElNotification, ElMessageBox } from "element-plus";

// Define interfaces for type safety
interface Interview {
  _id?: string;
  candidate_id: string;
  interview_date: Date;
  status: string;
  result: string;
  notes: string;
}

interface Candidate {
  _id: string;
  name: string;
  status: string;
}

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref<any>();

// Interview form initialization
const form = ref<Interview>({
  candidate_id: "",
  interview_date: new Date(),
  status: "scheduled",
  result: "interviewing",
  notes: "",
});

// Validation rules
const rules = {
  candidate_id: [
    { required: true, message: "Please select a candidate", trigger: "change" },
  ],
  interview_date: [
    { required: true, message: "Please select an interview date", trigger: "change" },
  ],
  status: [
    { required: true, message: "Please select a status", trigger: "change" },
  ],
};

// Data arrays for interviews and candidates
const dataTable = ref<Interview[]>([]);
const candidates = ref<Candidate[]>([]);

// Computed property to filter active candidates
const activeCandidates = computed(() => {
  return candidates.value.filter(candidate => candidate.status === 'active');
});

// Helper function: Given a candidate ID, return the candidate name
function getCandidateName(candidateId: string): string {
  const candidate = candidates.value.find((c) => c._id === candidateId);
  return candidate ? candidate.name : candidateId;
}

// Fetch interviews using Meteor.call with callbacks
function fetchInterviews() {
  loading.value = true;
  Meteor.call("fetchInterviews", (error: any, result: Interview[]) => {
    if (error) {
      ElNotification.error({
        title: "Error",
        message: error.message || "Failed to fetch interviews.",
      });
    } else {
      dataTable.value = result;
    }
    loading.value = false;
  });
}

// Fetch candidates (assumes a similar Meteor method or publication exists)
function fetchCandidates() {
  Meteor.call("fetchCandidates", (error: any, result: Candidate[]) => {
    if (error) {
      console.error("Error fetching candidates:", error);
    } else {
      candidates.value = result;
    }
  });
}

// Open the dialog and reset the form
function openInterviewDialog() {
  resetForm();
  centerDialogVisible.value = true;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

// Handle add/update interview submission
function onSubmit() {
  loadingForm.value = true;
  refForm.value.validate((valid: boolean) => {
    if (valid) {
      if (form.value._id) {
        Meteor.call("updateInterview", form.value, (error: any, result: any) => {
          if (error) {
            ElNotification.error({
              title: "Error",
              message: error.message || "An error occurred.",
            });
          } else {
            ElNotification.success({
              title: "Success",
              message: "Interview updated successfully",
            });
            fetchInterviews();
            centerDialogVisible.value = false;
          }
          loadingForm.value = false;
        });
      } else {
        Meteor.call("insertInterview", form.value, (error: any, result: any) => {
          if (error) {
            ElNotification.error({
              title: "Error",
              message: error.message || "An error occurred.",
            });
          } else {
            ElNotification.success({
              title: "Success",
              message: "Interview added successfully",
            });
            fetchInterviews();
            centerDialogVisible.value = false;
          }
          loadingForm.value = false;
        });
      }
    } else {
      loadingForm.value = false;
      ElNotification.error({
        title: "Error",
        message: "Please fill in the required fields.",
      });
    }
  });
}

// Remove the interview using the server method
function removeInterview() {
  if (!form.value._id) return;
  Meteor.call(
    "deleteInterview",
    { _id: form.value._id },
    (error: any, result: any) => {
      if (error) {
        ElNotification.error({
          title: "Error",
          message: error.message || "Failed to delete interview.",
        });
      } else {
        ElNotification.success({
          title: "Success",
          message: "Interview deleted successfully",
        });
        fetchInterviews();
        centerDialogVisible.value = false;
      }
    }
  );
}

// Reset form values
function resetForm() {
  form.value = {
    candidate_id: "",
    interview_date: new Date(),
    status: "scheduled",
    result: "interviewing",
    notes: "",
  };
  if (refForm.value) {
    refForm.value.resetFields();
  }
}

// Edit an interview by populating the form
function editInterview(row: Interview) {
  form.value = { ...row };
  centerDialogVisible.value = true;
}

// Confirm and delete an interview from the table
function confirmDelete(row: Interview) {
  ElMessageBox.confirm(
    "Are you sure you want to delete this interview?",
    "Confirm Delete",
    {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  )
    .then(() => {
      Meteor.call(
        "deleteInterview",
        { _id: row._id },
        (error: any, result: any) => {
          if (error) {
            ElNotification.error({
              title: "Error",
              message: error.message || "Failed to delete interview.",
            });
          } else {
            ElNotification.success({
              title: "Success",
              message: "Interview deleted successfully",
            });
            fetchInterviews();
          }
        }
      );
    })
    .catch((error: any) => {
      if (error !== "cancel") {
        ElNotification.error({
          title: "Error",
          message: error.message || "Failed to delete interview.",
        });
      }
    });
}

// Basic action search/filtering functions
const searchQuery = ref("");
function filterActions() {
  // Additional filtering logic if needed
}

function matchesActionSearch(row: Interview): boolean {
  if (!searchQuery.value) return true;
  const query = searchQuery.value.toLowerCase();
  return (
    row.candidate_id.toLowerCase().includes(query) ||
    row.status.toLowerCase().includes(query) ||
    (row.notes && row.notes.toLowerCase().includes(query))
  );
}

const filteredTableData = computed(() => {
  if (!searchQuery.value) return dataTable.value;
  return dataTable.value.filter((row) => {
    return (
      row.candidate_id
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      row.status.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (row.notes &&
        row.notes.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
  });
});

// Function to set row class based on interview result (row-based styling)
function tableRowClassName({ row }: { row: Interview }) {
  if (row.result === 'pass') {
    return 'row-pass';
  } else if (row.result === 'fail') {
    return 'row-fail';
  }
  return '';
}

// Handle status change to set result accordingly
function onStatusChange(value: string) {
  if (value === 'scheduled') {
    form.value.result = 'interviewing';
  } else if (value === 'completed') {
    form.value.result = '';
  } else if (value === 'cancelled') {
    form.value.result = 'fail';
  }
}

// Computed property to disable result selection based on status
const isResultDisabled = computed(() => {
  return form.value.status === 'cancelled';
});

// Fetch interviews and candidates when the component mounts
onMounted(() => {
  fetchInterviews();
  fetchCandidates();
});
</script>

<style scoped>
/* Row background colors */
.row-pass {
  background-color: #d4edda; /* Light green background for pass */
}

.row-fail {
  background-color: #f8d7da; /* Light red background for fail */
}

/* Optional: Text color for the result column */
.text-success {
  color: #67c23a; /* Green text for pass */
}

.text-danger {
  color: #f56c6c; /* Red text for fail */
}

.text-warning {
  color: #e6a23c; /* Yellow text for interviewing */
}
</style>
