<template>
  <div class=" text-gray-900 p-4 sm:p-6 md:p-8">
    <button
      @click="openSalaryDialog"
      class="mb-4 sm:mb-6 md:mb-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold py-2 px-4 sm:px-6 rounded-md shadow-sm transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
    >
      Manage Salary
    </button>

    <!-- Dialog -->
    <div
      v-if="centerDialogVisible"
      class="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 px-4"
    >
      <div
        class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-lg border border-gray-200 relative transform transition-all duration-300 scale-100"
      >
        <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5">
          {{ form._id ? "Edit Salary Setup" : "Add Salary Setup" }}
        </h2>

        <!-- Close Button -->
        <button
          @click="closeDialog"
          class="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <form @submit.prevent="onSubmit" class="space-y-3 sm:space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1"
              >Employee</label
            >
            <select
              v-model="form.employee_id"
              class="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 text-sm sm:text-base"
              required
            >
              <option value="" disabled class="text-gray-400">
                Select an employee
              </option>
              <option
                v-for="employee in employees"
                :key="employee._id"
                :value="employee._id"
                class="text-gray-700"
              >
                {{ employee.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1"
              >Salary Type</label
            >
            <select
              v-model="form.salary_type_id"
              class="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 text-sm sm:text-base"
              required
            >
              <option value="" disabled class="text-gray-400">
                Select salary type
              </option>
              <option
                v-for="type in salaryTypes"
                :key="type._id"
                :value="type._id"
                class="text-gray-700"
              >
                {{ type.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1"
              >Amount</label
            >
            <div class="relative">
              <input
                type="number"
                v-model.number="form.amount"
                class="w-full border border-gray-300 rounded-md pr-8 p-2 text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 text-sm sm:text-base"
                placeholder="0"
                required
              />
              <span
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >$</span
              >
            </div>
          </div>

          <div
            class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4"
          >
            <button
              type="submit"
              :disabled="loadingForm"
              class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 sm:px-6 rounded-md shadow-sm transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 w-full sm:w-auto"
            >
              {{ form._id ? "Update" : "Add" }}
            </button>
            <button
              v-if="form._id"
              type="button"
              @click="removeSalarySetup"
              class="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 sm:px-6 rounded-md shadow-sm transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            >
              Delete
            </button>
            <button
              type="button"
              @click="resetForm"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 sm:px-6 rounded-md shadow-sm transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow-md overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th
              class="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              #
            </th>
            <th
              class="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Employee
            </th>
            <th
              class="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Salary Type
            </th>
            <th
              class="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Amount
            </th>
            <th
              class="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              <input
                v-model="searchQuery"
                class="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 placeholder-gray-400"
                placeholder="Search"
              />
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="(row, index) in filteredTableData"
            :key="row._id"
            class="hover:bg-gray-50 transition-all duration-200"
          >
            <td
              class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700"
            >
              {{ index + 1 }}
            </td>
            <td
              class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700"
            >
              {{ getEmployeeName(row.employee_id) }}
            </td>
            <td
              class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700"
            >
              {{ getSalaryTypeName(row.salary_type_id) }}
            </td>
            <td
              class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700"
            >
              {{ row.amount || "---" }}$
            </td>
            <td
              class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm flex flex-col sm:flex-row gap-2 sm:gap-3"
            >
              <button
                @click="editSalarySetup(row)"
                class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-1 px-3 sm:px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(row)"
                class="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1 px-3 sm:px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { Meteor } from "meteor/meteor";

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const form = ref({ employee_id: "", salary_type_id: "", amount: null });
const dataTable = ref([]);
const searchQuery = ref("");
const employees = ref([]);
const salaryTypes = ref([]);

const filteredTableData = computed(() => {
  return dataTable.value.filter((setup) =>
    setup.amount?.toString().includes(searchQuery.value) || 
    getEmployeeName(setup.employee_id).toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const notify = (message, type) => {
  alert(`${type.toUpperCase()}: ${message}`); // Replace with your preferred notification system
};

const openSalaryDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

const editSalarySetup = (setup) => {
  form.value = { ...setup };
  centerDialogVisible.value = true;
};

const closeDialog = () => {
  resetForm();
  centerDialogVisible.value = false;
};

const onSubmit = () => {
  loadingForm.value = true;
  const methodName = form.value._id ? "updateSalarySetup" : "insertSalarySetup";
  const formData = { ...form.value };
  if (methodName === "updateSalarySetup") {
    delete formData.created_at;
  }
  Meteor.call(methodName, formData, (err) => {
    loadingForm.value = false;
    if (err) {
      notify(`Operation failed: ${err.message}`, "error");
    } else {
      notify(form.value._id ? "Updated successfully" : "Added successfully", "success");
      resetForm();
      getData();
      centerDialogVisible.value = false;
    }
  });
};

const removeSalarySetup = () => {
  loadingForm.value = true;
  Meteor.call("deleteSalarySetup", { _id: form.value._id }, (err) => {
    loadingForm.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      resetForm();
      getData();
      centerDialogVisible.value = false;
    }
  });
};

const resetForm = () => {
  form.value = { employee_id: "", salary_type_id: "", amount: null };
};

const getData = () => {
  loading.value = true;
  Meteor.call("fetchSalarySetups", (err, res) => {
    loading.value = false;
    if (err) {
      notify(`Failed to fetch data: ${err.message}`, "error");
    } else {
      dataTable.value = res;
    }
  });
};

const getEmployees = () => {
  Meteor.call("fetchEmployees", (err, res) => {
    if (err) {
      notify(`Failed to fetch employees: ${err.message}`, "error");
    } else {
      employees.value = res;
    }
  });
};

const getSalaryTypes = () => {
  Meteor.call("fetchSalaryTypes", (err, res) => {
    if (err) {
      notify(`Failed to fetch salary types: ${err.message}`, "error");
    } else {
      salaryTypes.value = res;
    }
  });
};

const getEmployeeName = (employeeId) => {
  const emp = employees.value.find((employee) => employee._id === employeeId);
  return emp ? emp.name : employeeId;
};

const getSalaryTypeName = (salaryTypeId) => {
  const type = salaryTypes.value.find((type) => type._id === salaryTypeId);
  return type ? type.name : salaryTypeId;
};

const confirmDelete = (setup) => {
  if (confirm("Are you sure you want to delete this salary setup?")) {
    removeSalarySetupById(setup._id);
  } else {
    notify("Delete canceled", "info");
  }
};

const removeSalarySetupById = (setupId) => {
  if (!setupId) return;
  loading.value = true;
  Meteor.call("deleteSalarySetup", { _id: setupId }, (err) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      getData();
    }
  });
};

onMounted(() => {
  getData();
  getEmployees();
  getSalaryTypes();
});
</script>