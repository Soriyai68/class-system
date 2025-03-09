<template>
  <div>
    <!-- Manage Candidate Button -->
    <el-button type="info" plain @click="openCandidateDialog" class="mb-4">
      Manage Candidate
    </el-button>

    <!-- Candidate Dialog -->
    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Candidate' : 'Add Candidate'"
      width="500px"
      align-center
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
        <el-form-item label="Position" prop="position_id">
          <el-select v-model="form.position_id" placeholder="Select position">
            <el-option
              v-for="pos in positions"
              :key="pos._id"
              :label="pos.title"
              :value="pos._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Candidate" prop="name">
          <el-input
            v-model="form.name"
            placeholder="Enter candidate name"
            clearable
          />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            placeholder="Enter candidate email"
            clearable
          />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="Enter candidate phone"
            clearable
          />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Select status">
            <el-option label="Active" value="active" />
            <el-option label="Inactive" value="inactive" />
          </el-select>
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
            @click="removeCandidate"
            class="w-28"
          >
            Delete
          </el-button>
          <el-button @click="resetForm" class="w-28">Reset</el-button>
        </div>
      </el-form-item>
    </el-dialog>

    <!-- Candidates Table -->
    <el-table
      :data="filteredTableData"
      style="width: 100%"
      border
      stripe
      class="modern-table"
      v-loading="loading"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="name" label="Candidate Name" />
      <el-table-column prop="email" label="Email" />
      <el-table-column prop="phone" label="Phone" />

      <!-- Updated Status Column with Highlight -->
      <el-table-column label="Status">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Position">
        <template #default="scope">
          <span>{{ getPositionTitle(scope.row.position_id) }}</span>
        </template>
      </el-table-column>

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
            @click="editCandidate(scope.row)"
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

interface Candidate {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  position_id: string;
  created_at?: Date;
}

// Adjust the Position interface to use "title" instead of "name"
interface Position {
  _id: string;
  title: string;
}

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref<any>();

// Candidate form initialization
const form = ref<Candidate>({
  name: "",
  email: "",
  phone: "",
  status: "active",
  position_id: "",
});

// Array for candidates
const dataTable = ref<Candidate[]>([]);

// Array for positions (populated via Meteor.call)
const positions = ref<Position[]>([]);

// Search queries for table filtering
const searchQuery = ref("");
const actionSearch = ref("");

// Computed filtered candidates
const filteredTableData = computed(() => {
  return dataTable.value.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Validation rules
const rules = {
  name: [{ required: true, message: "Name is required", trigger: "blur" }],
  email: [{ required: true, message: "Email is required", trigger: "blur" }],
  position_id: [
    { required: true, message: "Position is required", trigger: "change" },
  ],
};

// Helper: Return the position title given its ID
const getPositionTitle = (position_id: string) => {
  const pos = positions.value.find((p) => p._id === position_id);
  return pos ? pos.title : "";
};

// Notification utility
const notify = (message: string, type: "success" | "error" | "info") => {
  ElNotification({ message, type, duration: 2000 });
};

// Open candidate dialog and reset form
const openCandidateDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

// Edit candidate (populate form with candidate data)
const editCandidate = (candidate: Candidate) => {
  form.value = { ...candidate };
  centerDialogVisible.value = true;
};

// Validate and submit form (insert or update)
const onSubmit = () => {
  loadingForm.value = true;
  refForm.value.validate((valid: boolean) => {
    if (!valid) {
      loadingForm.value = false;
      notify("Validation failed", "error");
      return;
    }
    const methodName = form.value._id ? "updateCandidate" : "insertCandidate";
    // Clone the form data to remove created_at for updateCandidate calls.
    const candidateData = { ...form.value };
    if (candidateData.created_at) {
      delete candidateData.created_at;
    }
    Meteor.call(methodName, candidateData, (err: Error) => {
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

// Delete candidate from dialog
const removeCandidate = () => {
  if (!form.value._id) return;
  loadingForm.value = true;
  Meteor.call("deleteCandidate", { _id: form.value._id }, (err: Error) => {
    loadingForm.value = false;
    if (err) {
      if ((err as any).error === "associated-with-interview") {
        notify(
          "Cannot delete candidate because they are associated with an interview",
          "error"
        );
      } else {
        notify(`Delete failed: ${err.message}`, "error");
      }
    } else {
      notify("Deleted successfully", "success");
      resetForm();
      getData();
      centerDialogVisible.value = false;
    }
  });
};

// Delete candidate by ID (from table)
const removeCandidateById = (candidateId: string) => {
  loading.value = true;
  Meteor.call("deleteCandidate", { _id: candidateId }, (err: Error) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      getData();
    }
  });
};

// Reset form to initial state
const resetForm = () => {
  refForm.value?.resetFields();
  form.value = {
    name: "",
    email: "",
    phone: "",
    status: "active",
    position_id: "",
  };
  delete form.value._id;
};

// Fetch candidates from the server
const getData = () => {
  loading.value = true;
  Meteor.call("fetchCandidates", (err: Error, res: Candidate[]) => {
    loading.value = false;
    if (err) {
      notify(`Failed to fetch candidates: ${err.message}`, "error");
    } else {
      dataTable.value = res;
    }
  });
};

// Fetch positions (assumes a Meteor method "fetchPositions" exists)
const getPositions = () => {
  Meteor.call("fetchPositions", (err: Error, res: Position[]) => {
    if (err) {
      notify(`Failed to fetch positions: ${err.message}`, "error");
    } else {
      positions.value = res;
    }
  });
};

// Update action search (this example simply mirrors searchQuery)
const filterActions = () => {
  actionSearch.value = searchQuery.value;
};

// Confirm deletion from table
const confirmDelete = (candidate: Candidate) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete "${candidate.name}"?`,
    "Confirmation",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      type: "warning",
    }
  )
    .then(() => {
      if (candidate._id) {
        removeCandidateById(candidate._id);
      }
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

const matchesActionSearch = (row: Candidate) => {
  return row.name.toLowerCase().includes(actionSearch.value.toLowerCase());
};

onMounted(() => {
  getData();
  getPositions();
});
</script>

<style scoped>
/* Add your component styling here */
</style>
