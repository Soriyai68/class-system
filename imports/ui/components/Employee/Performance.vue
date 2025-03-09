<template>
  <div>
    <!-- Manage Performance Button -->
    <el-button type="info" plain @click="openPerformanceDialog" class="mb-4">
      Manage Performance
    </el-button>

    <!-- Performance Dialog -->
    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Performance' : 'Add Performance'"
      width="500px"
      align-center
    >
      <el-form
        :model="form"
        ref="refForm"
        :rules="rules"
        label-width="120px"
        size="default"
        v-loading="loadingForm"
      >
        <!-- Select Employee -->
        <el-form-item label="Employee" prop="employee_id">
          <el-select v-model="form.employee_id" placeholder="Select an employee">
            <el-option
              v-for="employee in employees"
              :key="employee._id"
              :label="employee.name"
              :value="employee._id"
            />
          </el-select>
        </el-form-item>

        <!-- Performance Date -->
        <el-form-item label="Performance" prop="performance_date">
          <el-date-picker v-model="form.performance_date" type="date" placeholder="Select date" />
        </el-form-item>

        <!-- Performance Score (el-rate) -->
        <el-form-item label="Score" prop="score">
          <el-rate v-model="form.score" :max="5" allow-half />
        </el-form-item>

        <!-- Feedback -->
        <el-form-item label="Feedback" prop="feedback">
          <el-input v-model="form.feedback" type="textarea" placeholder="Enter feedback" />
        </el-form-item>
      </el-form>

      <el-form-item>
        <div class="flex justify-between space-x-2">
          <el-button type="primary" :loading="loadingForm" @click="onSubmit" class="w-28">
            {{ form._id ? "Update" : "Add" }}
          </el-button>
          <el-button v-if="form._id" type="danger" plain @click="removePerformance" class="w-28">
            Delete
          </el-button>
          <el-button @click="resetForm" class="w-28">Reset</el-button>
        </div>
      </el-form-item>
    </el-dialog>

    <!-- Performance Table -->
    <el-table :data="filteredTableData" style="width: 100%" border stripe class="font-semibold modern-table" v-loading="loading">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="Employee">
        <template #default="scope">
          {{ getEmployeeName(scope.row.employee_id) }}
        </template>
      </el-table-column>
      <el-table-column label="Performance Date">
        <template #default="scope">
          {{ formatDate(scope.row.performance_date) }}
        </template>
      </el-table-column>
      <el-table-column label="Score">
        <template #default="scope">
          <el-rate v-model="scope.row.score" :max="5" disabled />
        </template>
      </el-table-column>
      <el-table-column prop="feedback" label="Feedback" />
      <el-table-column label="Actions">
        <template #header>
          <el-input v-model="searchQuery" size="small" placeholder="Search" clearable />
        </template>
        <template #default="scope">
          <el-button size="small" type="info" plain @click="editPerformance(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" plain @click="confirmDelete(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElNotification, ElMessageBox } from "element-plus";
import { Meteor } from "meteor/meteor";

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref(null);
const form = ref({ employee_id: "", performance_date: "", score: 0, feedback: "" });
const dataTable = ref([]);
const searchQuery = ref("");
const employees = ref([]);

const filteredTableData = computed(() => {
  return dataTable.value.filter((performance) => {
    return performance.feedback.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const rules = {
  employee_id: [{ required: true, message: "Employee is required", trigger: "blur" }],
  performance_date: [{ required: true, message: "Performance date is required", trigger: "blur" }],
  score: [{ required: true, message: "Score is required", trigger: "blur" }],
  feedback: [{ required: true, message: "Feedback is required", trigger: "blur" }],
};

const notify = (message, type) => {
  ElNotification({ message, type, duration: 2000 });
};

const openPerformanceDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

const editPerformance = (performance) => {
  form.value = { ...performance };
  centerDialogVisible.value = true;
};

const onSubmit = () => {
  loadingForm.value = true;
  refForm.value.validate((valid) => {
    if (!valid) {
      loadingForm.value = false;
      notify("Validation failed", "error");
      return;
    }
    const methodName = form.value._id ? "updatePerformanceRecord" : "insertPerformance";
    Meteor.call(methodName, { ...form.value }, (err) => {
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
  });
};

const removePerformance = () => {
  loadingForm.value = true;
  Meteor.call("deletePerformanceRecord", { _id: form.value._id }, (err) => {
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
  refForm.value?.resetFields();
  form.value = { employee_id: "", performance_date: "", score: 0, feedback: "" };
  delete form.value._id;
};

const getData = () => {
  loading.value = true;
  Meteor.call("fetchPerformanceRecords", (err, res) => {
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

const getEmployeeName = (employeeId) => {
  const emp = employees.value.find((employee) => employee._id === employeeId);
  return emp ? emp.name : employeeId;
};

const confirmDelete = (performance) => {
  ElMessageBox.confirm("Are you sure you want to delete this performance record?", "Confirmation", {
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    type: "warning",
  })
    .then(() => {
      removePerformanceById(performance._id);
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

const formatDate = (date) => {
  const d = new Date(date);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

const removePerformanceById = (performanceId) => {
  if (!performanceId) return;
  loading.value = true;
  Meteor.call("deletePerformanceRecord", { _id: performanceId }, (err) => {
    loading.value = false;
    if (err) notify(`Delete failed: ${err.message}`, "error");
    else {
      notify("Deleted successfully", "success");
      getData();
    }
  });
};

onMounted(() => {
  getData();
  getEmployees();
});
</script>
