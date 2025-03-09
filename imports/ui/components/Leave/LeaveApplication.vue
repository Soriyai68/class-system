<template>
  <div>
    <!-- Add Leave Application Button -->
    <div class="flex shadow-lg shadow-red-500"> 
      <el-button
        type="info"
        plain
        @click="openLeaveApplicationDialog"
        class="mb-4 mr-2"
      >
        Manage Leave Application
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="Search leave applications"
        clearable
        style="margin-bottom: 20px; width: 300px"
        @input="filterLeaveApplications"
      />
    </div>
    <!-- Leave Application Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="form._id ? 'Edit Leave Application' : 'Add Leave Application'"
      width="500px"
      center
      :close-on-click-modal="true"
    >
      <el-form
        :model="form"
        ref="formRef"
        :rules="rules"
        label-width="120px"
        size="default"
        v-loading="loadingForm"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="Employee" prop="employee_id">
          <el-select
            v-model="form.employee_id"
            placeholder="Select employee"
            filterable
            remote
            reserve-keyword
            :remote-method="searchEmployees"
            :loading="loadingEmployees"
          >
            <el-option
              v-for="employee in employees"
              :key="employee._id"
              :label="employee.name"
              :value="employee._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Leave Type" prop="leave_type_id">
          <el-select
            v-model="form.leave_type_id"
            placeholder="Select leave type"
          >
            <el-option
              v-for="leaveType in leaveTypes"
              :key="leaveType._id"
              :label="leaveType.type_name"
              :value="leaveType._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Start Date" prop="start_date">
          <el-date-picker
            v-model="form.start_date"
            type="datetime"
            placeholder="Select start date"
          />
        </el-form-item>
        <el-form-item label="End Date" prop="end_date">
          <el-date-picker
            v-model="form.end_date"
            type="datetime"
            placeholder="Select end date"
          />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Select status">
            <el-option label="Pending" value="Pending" />
            <el-option label="Approved" value="Approved" />
            <el-option label="Rejected" value="Rejected" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="loadingForm" @click="onSubmit">
          {{ form._id ? "Update" : "Add" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Leave Applications Table -->
    <el-table
      :data="filteredLeaveApplications"
      style="width: 100%"
      border
      stripe
      class="modern-table"
      v-loading="loading"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="employee_name" label="Employee" />
      <el-table-column prop="leave_type_name" label="Leave Type" />
      <el-table-column prop="start_date" label="Start Date">
        <template #default="scope">
          {{ formatDateTime(scope.row.start_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="end_date" label="End Date">
        <template #default="scope">
          {{ formatDateTime(scope.row.end_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button
            size="small"
            type="info"
            plain
            @click="editLeaveApplication(scope.row)"
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
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { Meteor } from "meteor/meteor";
import { ElNotification, ElMessageBox } from "element-plus";

export default {
  setup() {
    // Dialog & Form related refs
    const dialogVisible = ref(false);
    const loadingForm = ref(false);
    const loading = ref(false);
    const loadingEmployees = ref(false);
    const formRef = ref(null);
    const form = ref({
      employee_id: "",
      leave_type_id: "",
      start_date: "",
      end_date: "",
      status: "",
    });

    // Data Arrays
    const leaveApplications = ref([]);
    const employees = ref([]);
    const leaveTypes = ref([]);
    // Selected Employee for Filtering Leave Applications
    const selectedEmployee = ref("");
    // Search query for filtering table data
    const searchQuery = ref("");

    // Computed property to filter leave applications based on search query
    const filteredLeaveApplications = computed(() => {
      if (!searchQuery.value) {
        return leaveApplications.value;
      }
      return leaveApplications.value.filter((application) => {
        return (
          application.employee_name
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase()) ||
          application.leave_type_name
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase()) ||
          application.status
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase())
        );
      });
    });

    // Validation rules
    const rules = {
      employee_id: [
        { required: true, message: "Employee is required", trigger: "blur" },
      ],
      leave_type_id: [
        { required: true, message: "Leave type is required", trigger: "blur" },
      ],
      start_date: [
        { required: true, message: "Start date is required", trigger: "blur" },
      ],
      end_date: [
        { required: true, message: "End date is required", trigger: "blur" },
      ],
      status: [
        { required: true, message: "Status is required", trigger: "blur" },
      ],
    };

    // Notification helper
    const notify = (message, type) => {
      ElNotification({ message, type, duration: 2000 });
    };

    // Open the dialog and reset form
    const openLeaveApplicationDialog = () => {
      resetForm();
      dialogVisible.value = true;
    };

    // Edit a leave application and open dialog
    const editLeaveApplication = (leaveApplication) => {
      form.value = { ...leaveApplication };
      dialogVisible.value = true;
    };

    // Form submit handler
    const onSubmit = () => {
      loadingForm.value = true;
      formRef.value.validate((valid) => {
        if (!valid) {
          loadingForm.value = false;
          notify("Validation failed", "error");
          return;
        }
        const methodName = form.value._id
          ? "updateLeaveApplication"
          : "insertLeaveApplication";
        const {
          created_at,
          updated_at,
          employee_name,
          leave_type_name,
          ...submitData
        } = form.value;
        Meteor.call(methodName, { ...submitData }, (err) => {
          loadingForm.value = false;
          if (err) {
            notify(`Operation failed: ${err.message}`, "error");
          } else {
            notify(
              form.value._id ? "Updated successfully" : "Added successfully",
              "success"
            );
            resetForm();
            getLeaveApplications();
            dialogVisible.value = false;
          }
        });
      });
    };

    // Confirm delete of a leave application
    const confirmDelete = (leaveApplication) => {
      ElMessageBox.confirm(
        "Are you sure you want to delete this leave application?",
        "Confirmation",
        {
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          type: "warning",
        }
      )
        .then(() => {
          deleteLeaveApplication(leaveApplication._id);
        })
        .catch(() => {
          notify("Delete canceled", "info");
        });
    };

    // Delete a leave application
    const deleteLeaveApplication = (_id) => {
      if (!_id) return;
      loading.value = true;
      Meteor.call("deleteLeaveApplication", { _id }, (err) => {
        loading.value = false;
        if (err) {
          notify(`Delete failed: ${err.message}`, "error");
        } else {
          notify("Deleted successfully", "success");
          getLeaveApplications();
        }
      });
    };

    // Reset form to initial state
    const resetForm = () => {
      formRef.value?.resetFields();
      form.value = {
        employee_id: "",
        leave_type_id: "",
        start_date: "",
        end_date: "",
        status: "",
      };
      delete form.value._id;
    };

    // Fetch leave applications; filter by selectedEmployee if provided
    const getLeaveApplications = () => {
      loading.value = true;
      Meteor.call(
        "fetchLeaveApplications",
        { employee_id: selectedEmployee.value },
        (err, res) => {
          loading.value = false;
          if (err) {
            notify(
              `Failed to fetch leave applications: ${err.message}`,
              "error"
            );
          } else {
            leaveApplications.value = res;
          }
        }
      );
    };

    // Fetch all employees (for both form and filter)
    const getEmployees = () => {
      Meteor.call("fetchEmployees", (err, res) => {
        if (err) {
          notify(`Failed to fetch employees: ${err.message}`, "error");
        } else {
          employees.value = res;
        }
      });
    };

    // Remote search for employees in the leave application form
    // If the query is empty, reload all employees
    const searchEmployees = (query) => {
      if (!query) {
        getEmployees();
        return;
      }
      loadingEmployees.value = true;
      Meteor.call("searchEmployees", { query }, (err, res) => {
        loadingEmployees.value = false;
        if (err) {
          notify(`Failed to search employees: ${err.message}`, "error");
        } else {
          employees.value = res;
        }
      });
    };

    // Fetch leave types
    const getLeaveTypes = () => {
      Meteor.call("fetchLeaveTypes", (err, res) => {
        if (err) {
          notify(`Failed to fetch leave types: ${err.message}`, "error");
        } else {
          leaveTypes.value = res;
        }
      });
    };

    // Helper to return tag type based on status
    const getStatusTagType = (status) =>
      status === "Pending"
        ? "warning"
        : status === "Approved"
        ? "success"
        : "danger";

    // Format date/time for display
    const formatDateTime = (date) => new Date(date).toLocaleString();

    // Load initial data
    onMounted(() => {
      getLeaveApplications();
      getEmployees();
      getLeaveTypes();
    });

    return {
      dialogVisible,
      loading,
      loadingForm,
      loadingEmployees,
      formRef,
      form,
      leaveApplications,
      employees,
      leaveTypes,
      rules,
      searchQuery,
      filteredLeaveApplications,
      openLeaveApplicationDialog,
      editLeaveApplication,
      onSubmit,
      confirmDelete,
      deleteLeaveApplication,
      resetForm,
      searchEmployees,
      getStatusTagType,
      formatDateTime,
      getLeaveApplications,
    };
  },
};
</script>

<style scoped>
/* Optional additional styling */
</style>
