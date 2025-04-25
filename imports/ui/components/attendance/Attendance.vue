<template>
  <div class="relative">
    <!-- Sticky Container -->
    <div class="sticky top-0 bg-white z-10 p-4 shadow-md rounded-t-lg">
      <el-button
        type="info"
        plain
        @click="openAttendanceDialog"
        class="mb-4 mt-4"
      >
        Manage Attendance
      </el-button>
    </div>

    <!-- Attendance Dialog -->
    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Attendance' : 'Add Attendance'"
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
        <el-form-item label="Employee" prop="employee_id">
          <el-select
            v-model="form.employee_id"
            placeholder="Select an employee"
          >
            <el-option
              v-for="employee in employees"
              :key="employee._id"
              :label="employee.name"
              :value="employee._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Attendance" prop="attendance_date">
          <el-date-picker
            v-model="form.attendance_date"
            type="date"
            placeholder="Select date"
          />
        </el-form-item>
        <el-form-item label="In Time" prop="in_time">
          <el-date-picker
            v-model="form.in_time"
            type="datetime"
            placeholder="Select in time"
          />
        </el-form-item>

        <el-form-item label="Out Time" prop="out_time">
          <el-date-picker
            v-model="form.out_time"
            type="datetime"
            placeholder="Select out time"
          />
        </el-form-item>
        <el-form-item label="Session" prop="session">
          <el-select v-model="form.session" placeholder="Select session">
            <el-option label="Morning" value="Morning" />
            <el-option label="Afternoon" value="Afternoon" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Select status">
            <el-option label="Present" value="Present" />
            <el-option label="Absent" value="Absent" />
            <el-option label="Late" value="Late" />
          </el-select>
        </el-form-item>
        <el-form-item label="Reason" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            placeholder="Enter reason"
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
            @click="removeAttendance"
            class="w-28"
          >
            Delete
          </el-button>
          <el-button @click="resetForm" class="w-28">Reset</el-button>
        </div>
      </el-form-item>
    </el-dialog>

    <!-- Attendance Table -->
    <el-table
      :data="paginatedTableData"
      style="width: 100%"
      border
      stripe
      class="font-semibold modern-table"
      v-loading="loading"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="Employee">
        <template #default="scope">
          {{ getEmployeeName(scope.row.employee_id) }}
        </template>
      </el-table-column>
      <el-table-column label="Attendance Date">
        <template #default="scope">
          {{ formatDateOnly(scope.row.attendance_date) }}
        </template>
      </el-table-column>
      <el-table-column label="In Time">
        <template #default="scope">
          {{ formatDate(scope.row.in_time) }}
        </template>
      </el-table-column>
      <el-table-column label="Out Time">
        <template #default="scope">
          {{ formatDate(scope.row.out_time) }}
        </template>
      </el-table-column>
      <el-table-column label="Reason">
        <template #default="scope">
          {{ scope.row.reason }}
        </template>
      </el-table-column>
      <el-table-column label="Status" prop="status">
        <template #default="scope">
          <span
            :class="{
              'bg-green-200 text-green-800 px-2 py-1 rounded-md':
                scope.row.status === 'Present',
              'bg-red-200 text-red-800 px-2 py-1 rounded-md':
                scope.row.status === 'Absent',
              'bg-yellow-200 text-yellow-800 px-2 py-1 rounded-md':
                scope.row.status === 'Late',
            }"
          >
            {{ scope.row.status }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Session" prop="session">
        <template #default="scope">
          <span
            :class="{
              'bg-blue-200 text-blue-800 px-2 py-1 rounded-md':
                scope.row.session === 'Morning',
              'bg-purple-200 text-purple-800 px-2 py-1 rounded-md':
                scope.row.session === 'Afternoon',
            }"
          >
            {{ scope.row.session }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Actions">
        <template #header>
          <el-input
            v-model="searchQuery"
            size="small"
            placeholder="Search"
            clearable
          />

          <el-select
            v-model="searchSession"
            placeholder="Select session"
            size="small"
            clearable
            @change="onSearch"
          >
            <el-date-picker
              v-model="searchDate"
              type="date"
              placeholder="Search by date"
              size="small"
              clearable
            />
            <el-option label="All Sessions" value="" />
            <el-option label="Morning" value="Morning" />
            <el-option label="Afternoon" value="Afternoon" />
          </el-select>
        </template>
        <template #default="scope">
          <el-button
            size="small"
            type="info"
            plain
            @click="editAttendance(scope.row)"
          >
            Edit
          </el-button>
          <el-button
            size="small"
            type="danger"
            plain
            @click="confirmDelete(scope.row)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="flex justify-center items-center p-4">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredTableData.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
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
const form = ref({
  employee_id: "",
  attendance_date: "",
  status: "",
  in_time: "",
  out_time: "",
  reason: "",
  session: "",
});
const dataTable = ref([]);
const searchQuery = ref("");
const searchDate = ref(null);
const searchSession = ref("");
const employees = ref([]);

const filteredTableData = computed(() => {
  return dataTable.value.filter((attendance) => {
    const matchesQuery = attendance.status
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesDate = searchDate.value
      ? formatDateOnly(attendance.attendance_date) ===
        formatDateOnly(searchDate.value)
      : true;
    const matchesSession = searchSession.value
      ? attendance.session === searchSession.value
      : true;
    return matchesQuery && matchesDate && matchesSession;
  });
});

const currentPage = ref(1);
const pageSize = ref(10);

const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTableData.value.slice(start, end);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};

const rules = {
  employee_id: [
    { required: true, message: "Employee is required", trigger: "blur" },
  ],
  attendance_date: [
    { required: true, message: "Attendance date is required", trigger: "blur" },
  ],
  status: [{ required: true, message: "Status is required", trigger: "blur" }],
  in_time: [
    { required: true, message: "In time is required", trigger: "blur" },
  ],
  out_time: [
    { required: true, message: "Out time is required", trigger: "blur" },
  ],
  session: [
    { required: true, message: "Session is required", trigger: "blur" },
  ],
};

const notify = (message, type) => {
  ElNotification({ message, type, duration: 2000 });
};

const openAttendanceDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

const editAttendance = (attendance) => {
  form.value = { ...attendance };
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
    const methodName = form.value._id ? "updateAttendance" : "insertAttendance";
    Meteor.call(methodName, { ...form.value }, (err) => {
      loadingForm.value = false;
      if (err) {
        notify(`Operation failed: ${err.message}`, "error");
      } else {
        notify(
          form.value._id ? "Updated successfully" : "Added successfully",
          "success"
        );
        resetForm();
        getData();
        centerDialogVisible.value = false;
      }
    });
  });
};

const removeAttendance = () => {
  loadingForm.value = true;
  Meteor.call("deleteAttendance", { _id: form.value._id }, (err) => {
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
  form.value = {
    employee_id: "",
    attendance_date: "",
    status: "",
    in_time: "",
    out_time: "",
    reason: "",
    session: "",
  };
  delete form.value._id;
};

const getData = () => {
  loading.value = true;
  Meteor.call("fetchAttendance", (err, res) => {
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

const confirmDelete = (attendance) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete this attendance?`,
    "Confirmation",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      type: "warning",
    }
  )
    .then(() => {
      removeAttendanceById(attendance._id);
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
};

const formatDateOnly = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

const removeAttendanceById = (attendanceId) => {
  if (!attendanceId) return;
  loading.value = true;
  Meteor.call("deleteAttendance", { _id: attendanceId }, (err) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      getData();
    }
  });
};

const onSearch = () => {
  // Trigger the computed property to re-evaluate
  filteredTableData.value = [...filteredTableData.value];
};

onMounted(() => {
  getData();
  getEmployees();
});
</script>

<style>
</style>
