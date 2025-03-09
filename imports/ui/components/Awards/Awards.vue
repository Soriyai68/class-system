<template>
  <div>
    <!-- Manage Awards Button -->
    <el-button type="info" plain @click="openAwardDialog" class="mb-4">
      Manage Awards
    </el-button>

    <!-- Award Dialog -->
    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Award' : 'Add Award'"
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
        <!-- Use el-select to choose an employee -->
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
        <el-form-item label="Award Date" prop="award_date">
          <el-date-picker
            v-model="form.award_date"
            type="date"
            placeholder="Select date"
          />
        </el-form-item>
        <el-form-item label="Reason" prop="reason">
          <el-input
            v-model="form.reason"
            placeholder="Enter reason"
            clearable
          />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Select status">
            <el-option label="Received" value="Received" />
            <el-option label="Pending" value="Pending" />
          </el-select>
        </el-form-item>

        <el-form-item label="AwardUrl" prop="imageUrl">
          <div class="flex flex-col items-end">
            <input type="file" ref="fileInput" @change="handleChange" class="w-full" />
            <el-button type="primary" size="mini" @click="handleUpload" v-if="file" class="mt-2">
              Upload
              <el-icon class="el-icon--right">
                <Upload />
              </el-icon>
            </el-button>

            <div v-if="form.imageUrl" class="relative w-full max-w-xs mt-4">
              <div class="relative group w-32 h-32">
                <img :src="form.imageUrl" alt="Uploaded Image" class="w-full h-full object-cover rounded-lg shadow border border-gray-200 transition duration-300 ease-in-out group-hover:opacity-80" />
                <el-button size="mini" circle :icon="Delete" @click="removeImageUrl" class="absolute top-2 right-2 bg-white text-gray-500 hover:text-red-500 hover:bg-gray-100 shadow group-hover:opacity-100 opacity-0 transition duration-300 ease-in-out" />
              </div>
            </div>
          </div>
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
            @click="removeAward"
            class="w-28"
          >
            Delete
          </el-button>
          <el-button @click="resetForm" class="w-28">Reset</el-button>
        </div>
      </el-form-item>
    </el-dialog>

    <!-- Awards Table -->
    <el-table
      :data="filteredTableData"
      style="width: 100%"
      border
      stripe
      class="font-semibold modern-table"
      v-loading="loading"
    >
      <el-table-column type="index" label="#" width="60" />
      <!-- Instead of showing employee_id, display the employee's name -->
      <el-table-column label="Employee">
        <template #default="scope">
          {{ getEmployeeName(scope.row.employee_id) }}
        </template>
      </el-table-column>
      <el-table-column label="Award Date">
        <template #default="scope">
          {{ formatDate(scope.row.award_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="Reason" />
      <el-table-column label="Status" prop="status" />
      <el-table-column label="Award Picture">
        <template #default="scope">
          <div class="flex justify-center">
            <img v-if="scope.row.imageUrl" :src="scope.row.imageUrl" alt="Award Image" class="w-12 h-12 object-cover rounded" />
          </div>
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
        </template>
        <template #default="scope">
          <el-button
            size="small"
            type="info"
            plain
            @click="editAward(scope.row)"
            >Edit</el-button
          >
          <el-button
            size="small"
            type="danger"
            plain
            @click="confirmDelete(scope.row)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElNotification, ElMessageBox } from "element-plus";
import { Meteor } from "meteor/meteor";
import { Delete, Upload } from "@element-plus/icons-vue";
import FilesCollection from "/imports/api/files/files";

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref(null);
const form = ref({ employee_id: "", award_date: "", reason: "", status: "Pending", imageUrl: "" });
const dataTable = ref([]);
const searchQuery = ref("");
const employees = ref([]);

const filteredTableData = computed(() => {
  return dataTable.value.filter((award) =>
    award.reason.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const rules = {
  employee_id: [
    { required: true, message: "Employee is required", trigger: "blur" },
  ],
  award_date: [
    { required: true, message: "Award date is required", trigger: "blur" },
  ],
  reason: [{ required: true, message: "Reason is required", trigger: "blur" }],
  status: [{ required: true, message: "Status is required", trigger: "blur" }],
  imageUrl: [{ required: false, message: "Image is required", trigger: "blur" }],
};

const notify = (message, type) => {
  ElNotification({ message, type, duration: 2000 });
};

const openAwardDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

const editAward = (award) => {
  form.value = { ...award };
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
    const methodName = form.value._id ? "updateAward" : "insertAward";
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

const removeAward = () => {
  loadingForm.value = true;
  Meteor.call("deleteAward", { _id: form.value._id }, (err) => {
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
  form.value = { employee_id: "", award_date: "", reason: "", status: "Pending", imageUrl: "" };
  delete form.value._id;
};

const getData = () => {
  loading.value = true;
  Meteor.call("fetchAwards", (err, res) => {
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

const confirmDelete = (award) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete this award?`,
    "Confirmation",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      type: "warning",
    }
  )
    .then(() => {
      removeAwardById(award._id);
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

const formatDate = (date) => {
  const d = new Date(date);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const day = days[d.getDay()];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const removeAwardById = (awardId) => {
  if (!awardId) return;
  loading.value = true;
  Meteor.call("deleteAward", { _id: awardId }, (err) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Deleted successfully", "success");
      getData();
    }
  });
};

const file = ref(null);
const fileData = ref([]);

const handleChange = (e) => {
  if (form.value.imageUrl) {
    ElNotification.warning({
      title: "Action Required",
      message: "Please remove the existing image before selecting a new file.",
    });
    return;
  }

  const target = e.target;
  if (target && target.files) {
    file.value = target.files[0];
  }
};

const handleUpload = () => {
  if (!file.value) {
    ElNotification.warning({
      title: "File Required",
      message: "Please select a file to upload.",
    });
    return;
  }
  uploadToServer();
};

const uploadToServer = () => {
  if (!file.value) return;

  const uploadInstance = FilesCollection.insert({
    file: file.value,
    chunkSize: "dynamic",
  });

  uploadInstance.on("end", function (err, res) {
    if (err) {
      ElNotification.error({
        title: "Upload Error",
        message: "Error during upload: " + err.message,
      });
    } else {
      const fileId = this.config.fileId;
      form.value.imageUrl = fileId;

      ElNotification.success({
        title: "Upload Successful",
        message: "File has been uploaded successfully!",
        duration: 3000,
      });

      getFileUploads();

      file.value = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = null;
    }
  });
};

const getFileUploads = () => {
  Meteor.call("findImageData", (err, res) => {
    if (!err) {
      fileData.value = res;
      const uploadedFile = res.find((file) => file._id === form.value.imageUrl);
      if (uploadedFile && uploadedFile.url) {
        form.value.imageUrl = uploadedFile.url;
      }
    }
  });
};

const removeFileFromServer = (id) => {
  if (!id) return;

  FilesCollection.remove({ _id: id }, (err) => {
    if (err) {
      console.log("Error removing file from server:", err);
      ElNotification.error({
        title: "Remove Error",
        message: "Error removing file: " + err.message,
      });
    } else {
      console.log("File removed from server");
      getFileUploads();
    }
  });
};

const removeImageUrl = () => {
  if (form.value.imageUrl) {
    const fileToRemove = fileData.value.find((file) => file.url === form.value.imageUrl);
    if (fileToRemove && fileToRemove._id) {
      removeFileFromServer(fileToRemove._id);
    }
    form.value.imageUrl = null;

    // Reset file input
    file.value = null;
    if (this.$refs.fileInput) this.$refs.fileInput.value = null;
  }
};

onMounted(() => {
  getData();
  getEmployees();
  getFileUploads();
});
</script>
