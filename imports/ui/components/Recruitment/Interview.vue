<template>
<<<<<<< HEAD
  <div class="container mx-auto p-4 sm:p-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <button
        @click="openInterviewDialog"
        class="bg-gray-200 hover:-rotate-3 hover:translate-x-2  duration-75 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition  ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
      >
        Manage Interview
      </button>

      <!-- Search Input -->
      <el-input
        v-model="searchQuery"
        placeholder="Search interviews..."
        clearable
        class="w-full sm:max-w-md rounded-md"
        prefix-icon="el-icon-search"
        @input="filterActions"
      />
    </div>
=======
  <div>
    <!-- Manage Interview Button -->
    <el-button type="info" plain @click="openInterviewDialog" class="mb-4">
      Manage Interview
    </el-button>
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd

    <!-- Interview Dialog -->
    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Interview' : 'Add Interview'"
<<<<<<< HEAD
      :width="dialogWidth"
      align-center
      class="rounded-lg shadow-xl"
=======
      width="500px"
      align-center 
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
      :close-on-click-modal="true"
    >
      <el-form
        :model="form"
        ref="refForm"
        :rules="rules"
<<<<<<< HEAD
        label-width="auto"
        size="default"
        v-loading="loadingForm"
        class="space-y-4"
      >
        <el-form-item label="Candidate" prop="candidate_id">
          <el-select
            v-model="form.candidate_id"
            placeholder="Select candidate"
            class="w-full rounded-md"
          >
=======
        label-width="120px"
        size="default"
        v-loading="loadingForm"
      >
        <el-form-item label="Candidate" prop="candidate_id">
          <el-select v-model="form.candidate_id" placeholder="Select candidate">
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
            <el-option
              v-for="candidate in activeCandidates"
              :key="candidate._id"
              :label="candidate.name"
              :value="candidate._id"
            />
          </el-select>
        </el-form-item>
<<<<<<< HEAD

=======
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
        <el-form-item label="Interview Date" prop="interview_date">
          <el-date-picker
            v-model="form.interview_date"
            type="date"
<<<<<<< HEAD
            placeholder="Select date"
            class="w-full rounded-md"
          />
        </el-form-item>

        <el-form-item label="Status" prop="status">
          <el-select
            v-model="form.status"
            placeholder="Select status"
            class="w-full rounded-md"
            @change="onStatusChange"
          >
=======
            placeholder="Select interview date"
          />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Select status" @change="onStatusChange">
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
            <el-option label="Scheduled" value="scheduled" />
            <el-option label="Completed" value="completed" />
            <el-option label="Cancelled" value="cancelled" />
          </el-select>
        </el-form-item>
<<<<<<< HEAD

        <el-form-item label="Result" prop="result">
          <el-select
            v-model="form.result"
            placeholder="Select result"
            class="w-full rounded-md"
            :disabled="isResultDisabled"
          >
=======
        <el-form-item label="Result" prop="result">
          <el-select v-model="form.result" placeholder="Select result" :disabled="isResultDisabled">
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
            <el-option label="Pass" value="pass" v-if="form.status === 'completed'" />
            <el-option label="Fail" value="fail" v-if="form.status === 'completed' || form.status === 'cancelled'" />
            <el-option label="Interviewing" value="interviewing" v-if="form.status === 'scheduled'" />
          </el-select>
        </el-form-item>
<<<<<<< HEAD

=======
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
        <el-form-item label="Notes" prop="notes">
          <el-input
            v-model="form.notes"
            placeholder="Enter notes"
            type="textarea"
<<<<<<< HEAD
            class="w-full rounded-md"
            :rows="3"
=======
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
          />
        </el-form-item>
      </el-form>

<<<<<<< HEAD
      <template #footer>
        <div class="flex justify-end gap-2 mt-4">
          <el-button @click="resetForm" class="w-full sm:w-auto rounded-md">
            Cancel
          </el-button>
=======
      <el-form-item>
        <div class="flex justify-between space-x-2">
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
          <el-button
            type="primary"
            :loading="loadingForm"
            @click="onSubmit"
<<<<<<< HEAD
            class="w-full sm:w-auto rounded-md"
          >
            {{ form._id ? "Update" : "Add" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Interviews Table -->
    <div class="mt-6 overflow-x-auto">
      <div class="shadow overflow-hidden border-b border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 hidden sm:table-header-group">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="interview in filteredTableData" :key="interview._id" :class="tableRowClassName({ row: interview })" class="flex flex-col sm:table-row">
              <td class="px-4 py-2 sm:table-cell">
                <span class="sm:hidden font-medium">No: </span>
                {{ filteredTableData.indexOf(interview) + 1 }}
              </td>
              <td class="px-4 py-2 sm:table-cell">
                <span class="sm:hidden font-medium">Candidate: </span>
                {{ getCandidateName(interview.candidate_id) }}
              </td>
              <td class="px-4 py-2 sm:table-cell">
                <span class="sm:hidden font-medium">Date: </span>
                {{ formatDate(interview.interview_date) }}
              </td>
              <td class="px-4 py-2 sm:table-cell">
                <span class="sm:hidden font-medium">Status: </span>
                {{ interview.status }}
              </td>
              <td class="px-4 py-2 sm:table-cell">
                <span class="sm:hidden font-medium">Result: </span>
                <span :class="{
                  'text-green-500': interview.result === 'pass',
                  'text-red-500': interview.result === 'fail',
                  'text-yellow-500': interview.result === 'interviewing',
                }">
                  {{ interview.result }}
                </span>
              </td>
              <td class="px-4 py-2 sm:table-cell">
                <span class="sm:hidden font-medium">Notes: </span>
                {{ interview.notes || '-' }}
              </td>
              <td class="px-4 py-2 sm:table-cell flex justify-end gap-2">
                <button
                  @click="editInterview(interview)"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md shadow-sm transition duration-300 w-full sm:w-auto"
                >
                  Edit
                </button>
                <button
                  @click="confirmDelete(interview)"
                  class="bg-red-500 ml-2 hover:-rotate-3 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md shadow-sm transition duration-300 w-full sm:w-auto"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredTableData.length === 0">
              <td colspan="7" class="px-4 py-4 text-center text-gray-500">
                No interviews found matching your search
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { Meteor } from "meteor/meteor";
import { ElNotification, ElMessageBox } from "element-plus";

<<<<<<< HEAD
// Interfaces
=======
// Define interfaces for type safety
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
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

<<<<<<< HEAD
// Reactive variables
=======
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref<any>();
<<<<<<< HEAD
const searchQuery = ref("");

// Form
=======

// Interview form initialization
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
const form = ref<Interview>({
  candidate_id: "",
  interview_date: new Date(),
  status: "scheduled",
  result: "interviewing",
  notes: "",
});

// Validation rules
const rules = {
<<<<<<< HEAD
  candidate_id: [{ required: true, message: "Please select a candidate", trigger: "change" }],
  interview_date: [{ required: true, message: "Please select a date", trigger: "change" }],
  status: [{ required: true, message: "Please select a status", trigger: "change" }],
};

// Data
const dataTable = ref<Interview[]>([]);
const candidates = ref<Candidate[]>([]);

// Computed properties
const activeCandidates = computed(() => candidates.value.filter(c => c.status === 'active'));
const dialogWidth = computed(() => {
  const width = window.innerWidth;
  return width < 640 ? '90%' : '500px';
});
const filteredTableData = computed(() => dataTable.value.filter(row => matchesActionSearch(row)));
const isResultDisabled = computed(() => form.value.status === 'cancelled');

// Functions
function getCandidateName(candidateId: string): string {
  const candidate = candidates.value.find(c => c._id === candidateId);
  return candidate ? candidate.name : candidateId;
}

=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
function fetchInterviews() {
  loading.value = true;
  Meteor.call("fetchInterviews", (error: any, result: Interview[]) => {
    if (error) {
<<<<<<< HEAD
      ElNotification.error({ title: "Error", message: error.message || "Failed to fetch interviews" });
=======
      ElNotification.error({
        title: "Error",
        message: error.message || "Failed to fetch interviews.",
      });
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
    } else {
      dataTable.value = result;
    }
    loading.value = false;
  });
}

<<<<<<< HEAD
=======
// Fetch candidates (assumes a similar Meteor method or publication exists)
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
function fetchCandidates() {
  Meteor.call("fetchCandidates", (error: any, result: Candidate[]) => {
    if (error) {
      console.error("Error fetching candidates:", error);
    } else {
      candidates.value = result;
    }
  });
}

<<<<<<< HEAD
=======
// Open the dialog and reset the form
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
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

<<<<<<< HEAD
=======
// Handle add/update interview submission
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
function onSubmit() {
  loadingForm.value = true;
  refForm.value.validate((valid: boolean) => {
    if (valid) {
<<<<<<< HEAD
      const method = form.value._id ? "updateInterview" : "insertInterview";
      Meteor.call(method, form.value, (error: any, result: any) => {
        if (error) {
          ElNotification.error({ title: "Error", message: error.message || "An error occurred" });
        } else {
          ElNotification.success({
            title: "Success",
            message: `Interview ${form.value._id ? "updated" : "added"} successfully`,
          });
          fetchInterviews();
          centerDialogVisible.value = false;
        }
        loadingForm.value = false;
      });
    } else {
      loadingForm.value = false;
      ElNotification.error({ title: "Error", message: "Please fill in all required fields" });
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
    }
  });
}

<<<<<<< HEAD
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
function resetForm() {
  form.value = {
    candidate_id: "",
    interview_date: new Date(),
    status: "scheduled",
    result: "interviewing",
    notes: "",
  };
<<<<<<< HEAD
  refForm.value?.resetFields();
}

=======
  if (refForm.value) {
    refForm.value.resetFields();
  }
}

// Edit an interview by populating the form
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
function editInterview(row: Interview) {
  form.value = { ...row };
  centerDialogVisible.value = true;
}

<<<<<<< HEAD
function confirmDelete(row: Interview) {
  ElMessageBox.confirm("Are you sure you want to delete this interview?", "Confirm Delete", {
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      Meteor.call("deleteInterview", { _id: row._id }, (error: any) => {
        if (error) {
          ElNotification.error({ title: "Error", message: error.message || "Failed to delete" });
        } else {
          ElNotification.success({ title: "Success", message: "Interview deleted successfully" });
          fetchInterviews();
        }
      });
    })
    .catch((error: any) => {
      if (error !== "cancel") {
        ElNotification.error({ title: "Error", message: "Failed to delete interview" });
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
      }
    });
}

<<<<<<< HEAD
function filterActions() {
  // Filter handled by computed property
}

function matchesActionSearch(row: Interview): boolean {
  if (!searchQuery.value.trim()) return true;
  const query = searchQuery.value.trim().toLowerCase();
  const candidateName = getCandidateName(row.candidate_id).toLowerCase();
  return (
    candidateName.includes(query) ||
    row.status.toLowerCase().includes(query) ||
    (row.notes && row.notes.toLowerCase().includes(query)) ||
    (row.result && row.result.toLowerCase().includes(query)) ||
    formatDate(row.interview_date).toLowerCase().includes(query)
  );
}

function tableRowClassName({ row }: { row: Interview }) {
  return row.result === 'pass' ? 'row-pass' : row.result === 'fail' ? 'row-fail' : '';
}

function onStatusChange(value: string) {
  if (value === 'scheduled') form.value.result = 'interviewing';
  else if (value === 'completed') form.value.result = '';
  else if (value === 'cancelled') form.value.result = 'fail';
}

=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
onMounted(() => {
  fetchInterviews();
  fetchCandidates();
});
</script>

<style scoped>
<<<<<<< HEAD
/* Base styles */
.container {
  max-width: 100%;
}

/* Responsive table */
table {
  width: 100%;
}

/* Row styles */
.row-pass {
  background-color: #d4edda;
}

.row-fail {
  background-color: #f8d7da;
}

/* Text colors */
.text-green-500 { color: #67c23a; }
.text-red-500 { color: #f56c6c; }
.text-yellow-500 { color: #e6a23c; }

/* Form input styling */
.el-input :deep(.el-input__inner),
.el-select :deep(.el-input__inner),
.el-date-picker :deep(.el-input__inner) {
  border-radius: 6px;
}

.el-input :deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  padding-left: 8px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .el-form-item {
    margin-bottom: 1rem;
  }

  .el-form-item__label {
    width: 100% !important;
    text-align: left;
    margin-bottom: 0.25rem;
  }

  .el-form-item__content {
    width: 100%;
  }

  td {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

@media (min-width: 640px) {
  td {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
}
</style>
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
