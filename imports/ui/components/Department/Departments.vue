<template>
  <div>
    <!-- Add Department Button -->
    <el-button type="info" plain @click="openDepartmentDialog" class="mb-4">
      Manage Department
    </el-button>

    <!-- Department Dialog -->
    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Department' : 'Add Department'"
      width="500px"
      center
      :close-on-click-modal="true"
    >
      <el-form
        :model="form"
        ref="refForm"
        :rules="rules"
        label-width="99px"
        size="default"
        v-loading="loadingForm"
      >
        <el-form-item label="Name" prop="name">
          <el-input
            v-model="form.name"
            placeholder="Enter department name"
            clearable
          />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input
            v-model="form.description"
            placeholder="Enter description"
            clearable
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
            @click="removeDepartment"
            class="w-28"
          >
            Delete
          </el-button>
          <el-button @click="resetForm" class="w-28">Reset</el-button>
        </div>
      </el-form-item>
    </el-dialog>

    <!-- Departments Table -->
    <el-table
      :data="filteredTableData"
      style="width: 99%"
      border
      stripe
      class="modern-table"
      v-loading="loading"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="name" label="Department Name" />
      <el-table-column prop="description" label="Description" />

      <!-- Actions Column with Search -->
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
            @click="editDepartment(scope.row)"
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
import { ElNotification, ElMessageBox } from "element-plus";
import { Meteor } from "meteor/meteor";

interface Department {
  _id?: string;
  name: string;
  description?: string;
}

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref();
const form = ref<Department>({ name: "", description: "" });
const dataTable = ref<Department[]>([]);
const searchQuery = ref("");
const actionSearch = ref("");

// Filter departments based on the search query
const filteredTableData = computed(() => {
  return dataTable.value.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Filter actions based on the search term
const matchesActionSearch = (row: Department) => {
  return row.name.toLowerCase().includes(actionSearch.value.toLowerCase());
};

// Form validation rules
const rules = {
  name: [{ required: true, message: "Name is required", trigger: "blur" }],
};

// Notification utility
const notify = (message: string, type: "success" | "error" | "info") => {
  ElNotification({ message, type, duration: 2000 });
};

// Open the department dialog
const openDepartmentDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

// Edit department
const editDepartment = (dept: Department) => {
  form.value = { ...dept };
  centerDialogVisible.value = true;
};

// Submit form (Add or Update)
const onSubmit = () => {
  loadingForm.value = true;
  refForm.value.validate((valid: boolean) => {
    if (!valid) {
      loadingForm.value = false;
      notify("Validation failed", "error");
      return;
    }
    const methodName = form.value._id ? "updateDepartment" : "insertDepartment";
    Meteor.call(methodName, { ...form.value }, (err: Error) => {
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

// Remove department
const removeDepartment = () => {
  loadingForm.value = true;
  Meteor.call("deleteDepartment", { _id: form.value._id }, (err: Error) => {
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

// Reset form fields
const resetForm = () => {
  refForm.value?.resetFields();
  form.value = { name: "", description: "" };
  delete form.value._id;
};

// Fetch departments data
const getData = () => {
  loading.value = true;
  Meteor.call("fetchDepartments", (err: Error, res: Department[]) => {
    loading.value = false;
    if (err) {
      notify(`Failed to fetch data: ${err.message}`, "error");
    } else {
      dataTable.value = res;
    }
  });
};

// Confirm deletion of department
const confirmDelete = (dept: Department) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete department "${dept.name}"?`,
    "Confirmation",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      type: "warning",
    }
  )
    .then(() => {
      removeDepartmentById(dept._id);
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

// Remove department by ID
const removeDepartmentById = (deptId: string | undefined) => {
  if (!deptId) return;
  loading.value = true;
  Meteor.call("deleteDepartment", { _id: deptId }, (err: Error) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      getData();
    }
  });
};

// On component mounted, fetch the data
onMounted(() => {
  getData();
});
</script>

<style scoped>
/* Optional additional styling */
</style>
