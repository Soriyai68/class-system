<template>
  <div class="text-gray-800 p-4 sm:p-6 md:p-8 ">
    <!-- Header with Button and Search -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
      <button
        @click="openSalaryTypeDialog"
        class="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
      >
        Manage Salary
      </button>
      <input
        v-model="searchQuery"
        class="w-full sm:w-1/2 border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
        placeholder="Search by name or description"
      />
    </div>

    <!-- SalaryType Dialog -->
    <div
      v-if="dialogVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border-t-4 border-amber-500 relative transform transition-all duration-300 scale-100">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-5 text-center">
          {{ form._id ? 'Edit Salary Type' : 'Add Salary Type' }}
        </h2>

        <!-- Close Button -->
        <button
          @click="dialogVisible = false"
          class="absolute top-3 right-3 text-gray-600 hover:text-amber-600 transition-colors duration-200"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              placeholder="Enter salary type name"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
              :class="{ 'border-red-500': !form.name && submitted }"
              required
            />
            <p v-if="!form.name && submitted" class="text-red-500 text-xs mt-1">Name is required</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              v-model="form.description"
              placeholder="Enter description"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
            />
          </div>

          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              @click="dialogVisible = false"
              class="bg-stone-200 hover:bg-stone-300 text-gray-700 font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loadingForm"
              class="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto disabled:opacity-50"
            >
              {{ form._id ? 'Update' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- SalaryTypes Table -->
    <div class="bg-white rounded-lg shadow-md overflow-x-auto">
      <table class="min-w-full divide-y divide-stone-200">
        <thead class="bg-amber-100">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-200">
          <tr
            v-for="(salaryType, index) in paginatedSalaryTypes"
            :key="salaryType._id"
            class="hover:bg-stone-50 transition-all duration-200"
          >
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ salaryType.name }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ salaryType.description || 'N/A' }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm flex flex-col sm:flex-row gap-2">
              <button
                @click="editSalaryType(salaryType)"
                class="bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold py-1 px-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(salaryType)"
                class="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex justify-center">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredSalaryTypes.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { Meteor } from "meteor/meteor";
import { ElMessage, ElMessageBox, type MessageParams } from "element-plus";

interface SalaryType {
  _id?: string;
  name: string;
  description?: string;
}

const dialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const submitted = ref(false);
const searchQuery = ref("");
const form = ref<SalaryType>({ name: "", description: "" });
const salaryTypes = ref<SalaryType[]>([]);

// Pagination variables
const currentPage = ref(1);
const pageSize = 10; // Fixed to 10 items per page

// Enhanced notify function
const notify = (
  message: string,
  type: "success" | "error" | "info" | "warning" = "info",
  options: Partial<MessageParams> = {}
) => {
  ElMessage({
    message,
    type,
    duration: 3000,
    showClose: true,
  });
};

// Computed property for filtered salary types
const filteredSalaryTypes = computed(() => {
  if (!searchQuery.value) return salaryTypes.value;
  const query = searchQuery.value.toLowerCase();
  return salaryTypes.value.filter((salaryType) => {
    const name = salaryType.name.toLowerCase();
    const description = salaryType.description?.toLowerCase() || "";
    return name.includes(query) || description.includes(query);
  });
});

// Computed property for paginated salary types
const paginatedSalaryTypes = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredSalaryTypes.value.slice(start, end);
});

const openSalaryTypeDialog = () => {
  resetForm();
  dialogVisible.value = true;
};

const editSalaryType = (salaryType: SalaryType) => {
  form.value = { ...salaryType };
  dialogVisible.value = true;
};

const onSubmit = () => {
  submitted.value = true;
  if (!form.value.name) {
    notify("Name is required", "error");
    return;
  }
  loadingForm.value = true;
  const methodName = form.value._id ? "updateSalaryType" : "insertSalaryType";
  Meteor.call(methodName, { ...form.value }, (err: Error) => {
    loadingForm.value = false;
    if (err) {
      notify(`Operation failed: ${err.message}`, "error", { duration: 5000 });
    } else {
      notify(
        form.value._id ? "Updated successfully" : "Added successfully",
        "success"
      );
      resetForm();
      getSalaryTypes();
      dialogVisible.value = false;
    }
  });
};

const confirmDelete = (salaryType: SalaryType) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete salary type "${salaryType.name}"?`,
    "Confirm Delete",
    {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  )
    .then(() => {
      deleteSalaryType(salaryType._id);
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

const deleteSalaryType = (_id: string | undefined) => {
  if (!_id) return;
  loading.value = true;
  Meteor.call("deleteSalaryType", { _id }, (err: Error) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      getSalaryTypes();
    }
  });
};

const resetForm = () => {
  form.value = { name: "", description: "" };
  submitted.value = false;
};

const getSalaryTypes = () => {
  loading.value = true;
  Meteor.call("fetchSalaryTypes", (err: Error, res: SalaryType[]) => {
    loading.value = false;
    if (err) {
      notify(`Failed to fetch salary types: ${err.message}`, "error");
    } else {
      salaryTypes.value = res;
    }
  });
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

onMounted(() => {
  getSalaryTypes();
});
</script>