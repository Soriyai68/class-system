<template>
  <div>
    <!-- Division Filter -->
    <div class="flex justify-normal items-center">
      <el-button type="info" plain @click="openPositionDialog" class="mb-4">
        Manage Position
      </el-button>
      <el-select
        v-model="selectedDivision"
        placeholder="Filter by division"
        class="mb-4 ml-4"
        style="width: 150px;"
      >
        <el-option
          v-for="division in divisions"
          :key="division._id"
          :label="division.name"
          :value="division._id"
        />
      </el-select>

      <!-- Add Position Button -->
    </div>
    <!-- Position Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="form._id ? 'Edit Position' : 'Add Position'"
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
      >
        <el-form-item label="Division" prop="division_id">
          <el-select v-model="form.division_id" placeholder="Select division">
            <el-option
              v-for="division in divisions"
              :key="division._id"
              :label="division.name"
              :value="division._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Position" prop="title">
          <el-input
            v-model="form.title"
            placeholder="Enter position title"
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

      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="loadingForm" @click="onSubmit">
          {{ form._id ? "Update" : "Add" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Positions Table -->
    <el-table
      :data="filteredPositions"
      style="width: 100%"
      border
      stripe
      class="modern-table"
      v-loading="loading"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="title" label="Title" />
      <el-table-column prop="description" label="Description" />
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button
            size="small"
            type="info"
            plain
            @click="editPosition(scope.row)"
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

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { Meteor } from "meteor/meteor";
import { ElNotification, ElMessageBox } from "element-plus";

interface Position {
  _id?: string;
  title: string;
  description?: string;
  division_id: string;
}

const dialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const formRef = ref<any>();
const form = ref<Position>({
  title: "",
  description: "",
  division_id: "",
});
const positions = ref<Position[]>([]);
const divisions = ref([]);
const selectedDivision = ref<string | null>(null);

// Validation rules for the form.
const rules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }],
  division_id: [
    { required: true, message: "Division ID is required", trigger: "blur" },
  ],
};

const notify = (message: string, type: "success" | "error" | "info") => {
  ElNotification({
    message,
    type,
    duration: 2000,
  });
};

const openPositionDialog = () => {
  resetForm();
  dialogVisible.value = true;
};

const editPosition = (pos: Position) => {
<<<<<<< HEAD
  // Create a deep copy of the position to avoid reference issues
  form.value = {
    _id: pos._id,
    title: pos.title,
    description: pos.description || '',
    division_id: pos.division_id,
  };
=======
  form.value = { ...pos };
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
  dialogVisible.value = true;
};

const onSubmit = () => {
  loadingForm.value = true;
  formRef.value.validate((valid: boolean) => {
    if (!valid) {
      loadingForm.value = false;
      notify("Validation failed", "error");
      return;
    }
<<<<<<< HEAD

    const methodName = form.value._id ? "updatePosition" : "insertPosition";
    const payload = { ...form.value };
    
    // Ensure description is included even if empty
    if (!payload.description) {
      payload.description = '';
    }

    Meteor.call(methodName, payload, (err: Error) => {
=======
    const methodName = form.value._id ? "updatePosition" : "insertPosition";
    Meteor.call(methodName, { ...form.value }, (err: Error) => {
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
      loadingForm.value = false;
      if (err) {
        notify(`Operation failed: ${err.message}`, "error");
      } else {
        notify(
          form.value._id ? "Updated successfully" : "Added successfully",
          "success"
        );
<<<<<<< HEAD
        dialogVisible.value = false;
        resetForm();
        getPositions();
=======
        resetForm();
        getPositions();
        dialogVisible.value = false;
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
      }
    });
  });
};

const confirmDelete = (pos: Position) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete position "${pos.title}"?`,
    "Confirmation",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      type: "warning",
    }
  )
    .then(() => {
      deletePosition(pos._id);
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

const deletePosition = (_id: string | undefined) => {
  if (!_id) return;
  loading.value = true;
  Meteor.call("deletePosition", { _id }, (err: Error) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      getPositions();
    }
  });
};

const resetForm = () => {
  formRef.value?.resetFields();
  form.value = {
    title: "",
    description: "",
    division_id: "",
  };
  delete form.value._id;
};

const getPositions = () => {
  loading.value = true;
  Meteor.call("fetchPositions", (err: Error, res: Position[]) => {
    loading.value = false;
    if (err) {
      notify(`Failed to fetch positions: ${err.message}`, "error");
    } else {
      positions.value = res;
    }
  });
};

const getDivisions = () => {
  Meteor.call("fetchDivisions", (err: Error, res: any[]) => {
    if (err) {
      notify(`Failed to fetch divisions: ${err.message}`, "error");
    } else {
      divisions.value = res;
    }
  });
};

const filteredPositions = computed(() => {
  if (!selectedDivision.value) {
    return positions.value;
  }
  return positions.value.filter(
    (position) => position.division_id === selectedDivision.value
  );
});

onMounted(() => {
  getPositions();
  getDivisions();
});
</script>

<style scoped>
/* Optional additional styling */
</style>
