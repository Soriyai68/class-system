<template>
  <div class="text-gray-800 p-4 sm:p-6 md:p-8">
    <!-- Header with Search and Button -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
      <button
        @click="openSalaryGenerateDialog"
        class="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
      >
        Generate Salary
      </button>
      <input
        v-model="searchQuery"
        placeholder="Search by employee name..."
        class="w-full sm:w-1/2 border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
      />
    </div>

    <!-- SalaryGenerate Dialog -->
    <div
      v-if="dialogVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border-t-4 border-amber-500 relative transform transition-all duration-300 scale-100">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-5 text-center">
          {{ form._id ? 'Edit Salary Record' : 'Add Salary Record' }}
        </h2>

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
              Employee <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.employee_id"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
              :class="{ 'border-red-500': !form.employee_id && submitted }"
              required
            >
              <option value="">Select an employee</option>
              <option v-for="employee in filteredEmployees" :key="employee._id" :value="employee._id">
                {{ employee.name }}
              </option>
            </select>
            <p v-if="!form.employee_id && submitted" class="text-red-500 text-xs mt-1">Employee selection is required</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Generated At <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.generated_at"
              type="date"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
              :class="{ 'border-red-500': !form.generated_at && submitted }"
              required
            />
            <p v-if="!form.generated_at && submitted" class="text-red-500 text-xs mt-1">Generated date is required</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Total Salary (Auto-calculated)
            </label>
            <input
              v-model.number="form.total_salary"
              type="number"
              step="0.01"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 bg-gray-100 cursor-not-allowed"
              readonly
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

    <!-- SalaryGenerate Table -->
    <div class="bg-white rounded-lg shadow-md overflow-x-auto">
      <table class="min-w-full divide-y divide-stone-200">
        <thead class="bg-amber-100">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Generated At</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Salary</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-200">
          <tr v-for="(salary, index) in filteredSalaryRecords" :key="salary._id" class="hover:bg-stone-50 transition-all duration-200">
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ index + 1 }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ getEmployeeName(salary.employee_id) }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ new Date(salary.generated_at).toLocaleDateString() }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ formatSalary(salary.total_salary) }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm flex flex-col sm:flex-row gap-2">
              <button
                @click="editSalaryGenerate(salary)"
                class="bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold py-1 px-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(salary)"
                class="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
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

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from "vue";
import { Meteor } from "meteor/meteor";
import { ElMessage, ElMessageBox, type MessageParams } from "element-plus";

interface SalaryGenerate {
  _id?: string;
  employee_id: string;
  generated_at: Date | string;
  total_salary: number;
}

interface Employee {
  _id: string;
  name: string;
  email?: string;
}

const dialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const submitted = ref(false);
const searchQuery = ref("");
const form = ref<SalaryGenerate>({ employee_id: "", generated_at: "", total_salary: 0 });
const salaryRecords = ref<SalaryGenerate[]>([]);
const employees = ref<Employee[]>([]);

const notify = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
  ElMessage({ message, type, duration: 3000, showClose: true });
};

const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value;
  return employees.value.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredSalaryRecords = computed(() => {
  if (!searchQuery.value) return salaryRecords.value;
  return salaryRecords.value.filter(salary => {
    const employeeName = getEmployeeName(salary.employee_id).toLowerCase();
    return employeeName.includes(searchQuery.value.toLowerCase());
  });
});

const formatSalary = (value: number) => {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Fetch salary setup amount for the selected employee
const fetchSalarySetupAmount = async (employeeId: string) => {
  if (!employeeId) return 0;
  try {
    const setups = await new Promise((resolve, reject) => {
      Meteor.call("fetchSalarySetupsForEmployee", { employee_id: employeeId }, (err: Error, res: any) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
    // Since only one salarySetup is allowed per employee, take the first (and only) record
    return setups.length > 0 ? setups[0].amount : 0;
  } catch (error) {
    notify(`Failed to fetch salary setup: ${error.message}`, "error");
    return 0;
  }
};

const openSalaryGenerateDialog = () => {
  resetForm();
  dialogVisible.value = true;
};

const editSalaryGenerate = (salary: SalaryGenerate) => {
  form.value = { ...salary, generated_at: new Date(salary.generated_at).toISOString().split('T')[0] };
  dialogVisible.value = true;
};

const onSubmit = () => {
  submitted.value = true;
  if (!form.value.employee_id || !form.value.generated_at) {
    notify("Employee and generated date are required", "error");
    return;
  }
  loadingForm.value = true;
  const methodName = form.value._id ? "updateSalaryGenerate" : "insertSalaryGenerate";
  const dataToSubmit = form.value._id
    ? { _id: form.value._id, employee_id: form.value.employee_id, generated_at: new Date(form.value.generated_at) }
    : { employee_id: form.value.employee_id, generated_at: new Date(form.value.generated_at) };
  
  Meteor.call(methodName, dataToSubmit, (err: Error) => {
    loadingForm.value = false;
    if (err) {
      notify(`Operation failed: ${err.message}`, "error", { duration: 5000 });
    } else {
      notify(form.value._id ? "Updated successfully" : "Added successfully", "success");
      resetForm();
      getSalaryRecords();
      dialogVisible.value = false;
    }
  });
};

// Watch for employee_id changes and update total_salary automatically
watch(() => form.value.employee_id, async (newEmployeeId) => {
  if (newEmployeeId && !form.value._id) { // Only update for new records, not edits
    form.value.total_salary = await fetchSalarySetupAmount(newEmployeeId);
  }
});

const confirmDelete = (salary: SalaryGenerate) => {
  const employeeName = getEmployeeName(salary.employee_id);
  ElMessageBox.confirm(
    `Are you sure you want to delete salary record for employee "${employeeName}"?`,
    "Confirm Delete",
    { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
  )
    .then(() => deleteSalaryGenerate(salary._id))
    .catch(() => notify("Delete canceled", "info"));
};

const deleteSalaryGenerate = (_id: string | undefined) => {
  if (!_id) return;
  loading.value = true;
  Meteor.call("deleteSalaryGenerate", { _id }, (err: Error) => {
    loading.value = false;
    if (err) notify(`Delete failed: ${err.message}`, "error");
    else {
      notify("Deleted successfully", "success");
      getSalaryRecords();
    }
  });
};

const resetForm = () => {
  form.value = { employee_id: "", generated_at: "", total_salary: 0 };
  submitted.value = false;
};

const getSalaryRecords = () => {
  loading.value = true;
  Meteor.call("fetchSalaryGenerate", (err: Error, res: SalaryGenerate[]) => {
    loading.value = false;
    if (err) notify(`Failed to fetch salary records: ${err.message}`, "error");
    else salaryRecords.value = res;
  });
};

const getEmployees = () => {
  loading.value = true;
  Meteor.call("fetchEmployees", (err: Error, res: Employee[]) => {
    loading.value = false;
    if (err) notify(`Failed to fetch employees: ${err.message}`, "error");
    else employees.value = res;
  });
};

const getEmployeeName = (employeeId: string) => {
  const employee = employees.value.find(emp => emp._id === employeeId);
  return employee ? employee.name : "Unknown Employee";
};

onMounted(() => {
  getSalaryRecords();
  getEmployees();
});
</script>