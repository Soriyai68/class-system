<template>
  <div class="min-h-screen text-gray-800 p-4 sm:p-6 md:p-8">
    <!-- Header with Button and Search -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
      <button
        @click="openSalaryEmployeeDialog"
        class="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto "
      >
        Manage Employee Salaries
      </button>
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by employee name or description..."
        class=" w-full sm:flex-1 border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
      />
    </div>

    <!-- SalaryEmployee Dialog -->
    <div
      v-if="dialogVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border-t-4 border-amber-500 relative transform transition-all duration-300 scale-100">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-5 text-center">
          {{ form._id ? 'Edit Employee Salary' : 'Add Employee Salary' }}
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
              Employee <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.employee_id"
              @change="fetchBaseSalary"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
              :class="{ 'border-red-500': !form.employee_id && submitted }"
              required
            >
              <option value="" disabled>Select an employee</option>
              <option v-for="employee in employees" :key="employee._id" :value="employee._id">
                {{ employee.name }} (ID: {{ employee._id }})
              </option>
            </select>
            <p v-if="!form.employee_id && submitted" class="text-red-500 text-xs mt-1">Employee selection is required</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Base Salary (Auto from Salary Generate)
            </label>
            <input
              :value="baseSalary !== null ? `${baseSalary}$` : ''"
              type="text"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 bg-gray-100 cursor-not-allowed"
              disabled
            />
            <p v-if="baseSalary === null && form.employee_id" class="text-red-500 text-xs mt-1">No salary generation record found</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adjustments</label>
            <input
              v-model.number="form.adjustments"
              type="number"
              placeholder="Enter adjustments (optional)"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              placeholder="Enter description (optional)"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
              rows="3"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Effective Date <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.effective_date"
              type="date"
              class="w-full border border-stone-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200"
              :class="{ 'border-red-500': !form.effective_date && submitted }"
              required
            />
            <p v-if="!form.effective_date && submitted" class="text-red-500 text-xs mt-1">Effective Date is required</p>
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
              :disabled="loadingForm || baseSalary === null"
              class="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto disabled:opacity-50"
            >
              {{ form._id ? 'Update' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- SalaryEmployees Table -->
    <div class="bg-white rounded-lg shadow-md overflow-x-auto">
      <table class="min-w-full divide-y divide-stone-200">
        <thead class="bg-amber-100">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee Name</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Base Salary</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Adjustments</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Salary</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Effective Date</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-200">
          <tr
            v-for="(salaryEmployee, index) in filteredSalaryEmployees"
            :key="salaryEmployee._id"
            class="hover:bg-stone-50 transition-all duration-200"
          >
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ index + 1 }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ getEmployeeName(salaryEmployee.employee_id) }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ `${salaryEmployee.base_salary}$` }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ salaryEmployee.adjustments || 0 }}</td>
            <td class="px-4 py-4 text-sm text-gray-700">{{ salaryEmployee.description || 'N/A' }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ `${salaryEmployee.total_salary}$` }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{{ new Date(salaryEmployee.effective_date).toLocaleDateString() }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm flex flex-col sm:flex-row gap-2">
              <button
                @click="editSalaryEmployee(salaryEmployee)"
                class="bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold py-1 px-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(salaryEmployee)"
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
import { ref, onMounted, computed } from "vue";
import { Meteor } from "meteor/meteor";
import { ElMessage, ElMessageBox, type MessageParams } from "element-plus";

interface SalaryEmployee {
  _id?: string;
  employee_id: string;
  base_salary: number;
  adjustments?: number;
  description?: string;
  total_salary: number;
  effective_date: string | Date;
}

interface Employee {
  _id: string;
  name: string;
}

const dialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const submitted = ref(false);
const form = ref<Partial<SalaryEmployee>>({ employee_id: "", adjustments: undefined, description: undefined, effective_date: "" });
const salaryEmployees = ref<SalaryEmployee[]>([]);
const employees = ref<Employee[]>([]);
const baseSalary = ref<number | null>(null);
const searchTerm = ref<string>('');

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

const filteredSalaryEmployees = computed(() => {
  if (!searchTerm.value.trim()) return salaryEmployees.value;
  
  const term = searchTerm.value.toLowerCase();
  return salaryEmployees.value.filter((salaryEmployee) => {
    const employeeName = getEmployeeName(salaryEmployee.employee_id).toLowerCase();
    const description = (salaryEmployee.description || '').toLowerCase();
    return employeeName.includes(term) || description.includes(term);
  });
});

const openSalaryEmployeeDialog = () => {
  resetForm();
  dialogVisible.value = true;
};

const editSalaryEmployee = (salaryEmployee: SalaryEmployee) => {
  form.value = {
    _id: salaryEmployee._id,
    employee_id: salaryEmployee.employee_id,
    adjustments: salaryEmployee.adjustments,
    description: salaryEmployee.description,
    effective_date: new Date(salaryEmployee.effective_date).toISOString().split('T')[0],
  };
  baseSalary.value = salaryEmployee.base_salary;
  dialogVisible.value = true;
};

const fetchBaseSalary = () => {
  if (!form.value.employee_id) {
    baseSalary.value = null;
    return;
  }
  Meteor.call("fetchBaseSalary", { employee_id: form.value.employee_id }, (err: Error, res: number) => {
    if (err) {
      console.error('Error fetching base salary:', err);
      notify(`Failed to fetch base salary: ${err.message}`, "error");
      baseSalary.value = null;
    } else {
      baseSalary.value = res;
    }
  });
};

const onSubmit = () => {
  submitted.value = true;
  if (!form.value.employee_id || !form.value.effective_date) {
    notify("All required fields must be filled", "error");
    return;
  }
  if (baseSalary.value === null) {
    notify("Cannot submit: No base salary available", "error");
    return;
  }

  loadingForm.value = true;
  const methodName = form.value._id ? "updateSalaryEmployee" : "insertSalaryEmployee";
  const payload = {
    ...(form.value._id && { _id: form.value._id }),
    employee_id: form.value.employee_id,
    ...(form.value.adjustments !== undefined && { adjustments: form.value.adjustments }),
    ...(form.value.description !== undefined && { description: form.value.description }),
    effective_date: new Date(form.value.effective_date),
  };

  console.log('Submitting payload:', payload);

  Meteor.call(methodName, payload, (err: Error) => {
    loadingForm.value = false;
    if (err) {
      notify(`Operation failed: ${err.message}`, "error", { duration: 5000 });
    } else {
      notify(
        form.value._id ? "Updated successfully" : "Added successfully",
        "success"
      );
      resetForm();
      getSalaryEmployees();
      dialogVisible.value = false;
    }
  });
};

const confirmDelete = (salaryEmployee: SalaryEmployee) => {
  const employeeName = getEmployeeName(salaryEmployee.employee_id);
  ElMessageBox.confirm(
    `Are you sure you want to delete salary for "${employeeName}"?`,
    "Confirm Delete",
    {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  )
    .then(() => {
      deleteSalaryEmployee(salaryEmployee._id);
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

const deleteSalaryEmployee = (_id: string | undefined) => {
  if (!_id) return;
  loading.value = true;
  Meteor.call("deleteSalaryEmployee", { _id }, (err: Error) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      getSalaryEmployees();
    }
  });
};

const resetForm = () => {
  form.value = { employee_id: "", adjustments: undefined, description: undefined, effective_date: "" };
  baseSalary.value = null;
  submitted.value = false;
};

const getSalaryEmployees = () => {
  loading.value = true;
  Meteor.call("fetchSalaryEmployees", { fields: { employee_id: 1, base_salary: 1, adjustments: 1, description: 1, total_salary: 1, effective_date: 1 } }, (err: Error, res: SalaryEmployee[]) => {
    loading.value = false;
    if (err) {
      console.error('Error fetching salary employees:', err);
      notify(`Failed to fetch salary employees: ${err.message}`, "error");
    } else {
      salaryEmployees.value = res || [];
      console.log('Salary employees fetched:', res);
    }
  });
};

const getEmployees = () => {
  Meteor.call("fetchEmployees", { fields: { name: 1 } }, (err: Error, res: Employee[]) => {
    if (err) {
      console.error('Error fetching employees:', err);
      notify(`Failed to fetch employees: ${err.message}`, "error");
    } else {
      employees.value = res || [];
      console.log('Employees fetched:', res);
    }
  });
};

const getEmployeeName = (employeeId: string) => {
  const employee = employees.value.find(emp => emp._id === employeeId);
  return employee ? employee.name : "Unknown";
};

onMounted(() => {
  getEmployees();
  getSalaryEmployees();
});
</script>