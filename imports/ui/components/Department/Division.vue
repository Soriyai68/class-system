<template>
  <div>
    <!-- Add Division Button -->
    <el-button type="info" plain @click="openDivisionDialog" class="mb-4">
      Manage Division
    </el-button>

    <!-- Division Dialog -->
    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Division' : 'Add Division'"
      width="500px"
      center
      :close-on-click-modal="true"
    >
      <el-form
        :model="form"
        ref="refForm"
        :rules="rules"
        label-width="120px"
        size="default"
        v-loading="loadingForm"
      >
        <el-form-item label="Department" prop="department_id">
          <el-select v-model="form.department_id" placeholder="Select Department">
            <el-option
              v-for="dept in departments"
              :key="dept._id"
              :label="dept.name"
              :value="dept._id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Division" prop="name">
          <el-input
            v-model="form.name"
            placeholder="Enter division name"
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
            @click="removeDivision"
            class="w-28"
          >
            Delete
          </el-button>
          <el-button @click="resetForm" class="w-28">Reset</el-button>
        </div>
      </el-form-item>
    </el-dialog>

    <!-- Divisions Table -->
    <el-table :data="filteredTableData" style="width: 99%" class="modern-table" border stripe v-loading="loading">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="name" label="Division Name" />
      <el-table-column prop="description" label="Description" />
      <el-table-column label="Department">
        <template #default="scope">
          {{ getDepartmentName(scope.row.department_id) }}
        </template>
      </el-table-column>

      <!-- Actions Column with Search -->
      <el-table-column label="Actions">
        <template #header>
          <el-input
            v-model="actionSearch"
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
            @click="editDivision(scope.row)"
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
import { computed, onMounted, ref } from "vue";
import { ElNotification, ElMessageBox } from "element-plus";
import { Meteor } from "meteor/meteor";

interface Department {
  _id: string;
  name: string;
}

interface Division {
  _id?: string;
  department_id: string;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref();
const form = ref<Division>({
  department_id: "",
  name: "",
  description: "",
});
const dataTable = ref<Division[]>([]);
const departments = ref<Department[]>([]);
const actionSearch = ref('');

const filteredTableData = computed(() => {
  return dataTable.value.filter((data) =>
    data.name.toLowerCase().includes(actionSearch.value.toLowerCase())
  );
});

const matchesActionSearch = (row: Division) => {
  return row.name.toLowerCase().includes(actionSearch.value.toLowerCase());
};

const rules = {
  department_id: [
    { required: true, message: "Department is required", trigger: "change" },
  ],
  name: [
    { required: true, message: "Division name is required", trigger: "blur" },
  ],
};

const notify = (message: string, type: "success" | "error" | "info") => {
  ElNotification({
    message,
    type,
    duration: 2000,
  });
};

const openDivisionDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

const editDivision = (div: Division) => {
  form.value = { ...div };
  centerDialogVisible.value = true;
};

const onSubmit = () => {
  loadingForm.value = true;
  refForm.value.validate((valid: boolean) => {
    if (!valid) {
      loadingForm.value = false;
      notify("Validation failed", "error");
      return;
    }
    const methodName = form.value._id ? "updateDivision" : "insertDivision";
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

const removeDivision = () => {
  loadingForm.value = true;
  Meteor.call("deleteDivision", { _id: form.value._id }, (err: Error) => {
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
  form.value = { department_id: "", name: "", description: "" };
  delete form.value._id;
};

const getData = () => {
  loading.value = true;
  Meteor.call("fetchDivisions", (err: Error, res: Division[]) => {
    loading.value = false;
    if (err) {
      notify(`Failed to fetch divisions: ${err.message}`, "error");
    } else {
      dataTable.value = res;
    }
  });
};

const getDepartments = () => {
  Meteor.call("fetchDepartments", (err: Error, res: Department[]) => {
    if (err) {
      notify(`Failed to fetch departments: ${err.message}`, "error");
    } else {
      departments.value = res;
    }
  });
};

const confirmDelete = (div: Division) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete division "${div.name}"?`,
    "Confirmation",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      type: "warning",
    }
  )
    .then(() => {
      removeDivisionById(div._id);
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

const removeDivisionById = (divId: string | undefined) => {
  if (!divId) return;
  loading.value = true;
  Meteor.call("deleteDivision", { _id: divId }, (err: Error) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      getData();
    }
  });
};

const getDepartmentName = (deptId: string) => {
  const dept = departments.value.find((d) => d._id === deptId);
  return dept ? dept.name : "Unknown";
};

onMounted(() => {
  getData();
  getDepartments();
});
</script>

<style scoped>
/* Optional additional styling */
</style>
