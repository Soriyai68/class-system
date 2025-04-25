<template>
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

    <!-- Interview Dialog -->
    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Interview' : 'Add Interview'"
      :width="dialogWidth"
      align-center
      class="rounded-lg shadow-xl"
      :close-on-click-modal="true"
    >
      <el-form
        :model="form"
        ref="refForm"
        :rules="rules"
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
            <el-option label="Scheduled" value="scheduled" />
            <el-option label="Completed" value="completed" />
            <el-option label="Cancelled" value="cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item label="Result" prop="result">
          <el-select
            v-model="form.result"
            placeholder="Select result"
            class="w-full rounded-md"
            :disabled="isResultDisabled"
          >
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
            class="w-full rounded-md"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2 mt-4">
          <el-button @click="resetForm" class="w-full sm:w-auto rounded-md">
            Cancel
          </el-button>
          <el-button
            type="primary"
            :loading="loadingForm"
            @click="onSubmit"
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
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { Meteor } from "meteor/meteor";
import { ElNotification, ElMessageBox } from "element-plus";

// Interfaces
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

// Reactive variables
const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref<any>();
const searchQuery = ref("");

// Form
const form = ref<Interview>({
  candidate_id: "",
  interview_date: new Date(),
  status: "scheduled",
  result: "interviewing",
  notes: "",
});

// Validation rules
const rules = {
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

function fetchInterviews() {
  loading.value = true;
  Meteor.call("fetchInterviews", (error: any, result: Interview[]) => {
    if (error) {
      ElNotification.error({ title: "Error", message: error.message || "Failed to fetch interviews" });
    } else {
      dataTable.value = result;
    }
    loading.value = false;
  });
}

function fetchCandidates() {
  Meteor.call("fetchCandidates", (error: any, result: Candidate[]) => {
    if (error) {
      console.error("Error fetching candidates:", error);
    } else {
      candidates.value = result;
    }
  });
}

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

function onSubmit() {
  loadingForm.value = true;
  refForm.value.validate((valid: boolean) => {
    if (valid) {
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
    }
  });
}

function resetForm() {
  form.value = {
    candidate_id: "",
    interview_date: new Date(),
    status: "scheduled",
    result: "interviewing",
    notes: "",
  };
  refForm.value?.resetFields();
}

function editInterview(row: Interview) {
  form.value = { ...row };
  centerDialogVisible.value = true;
}

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
      }
    });
}

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

onMounted(() => {
  fetchInterviews();
  fetchCandidates();
});
</script>

<style scoped>
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