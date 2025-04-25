<template>
  <div>
    <el-button type="info" plain @click="openEmployeeDialog" class="mb-4">
      Manage Employee
    </el-button>

    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'Edit Employee' : 'Add Employee'"
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
        <el-form-item label="Name" prop="name">
          <el-input
            v-model="form.name"
            placeholder="Enter employee name"
            clearable
          />
        </el-form-item>
        <el-form-item label="Division" prop="division_id">
          <el-select
            v-model="form.division_id"
            placeholder="Select Division"
            @change="handleDivisionChange"
          >
            <el-option
              v-for="div in divisions"
              :key="div._id"
              :label="div.name"
              :value="div._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Department">
          <el-input
            :value="getDepartmentName(form.department_id)"
            placeholder="Auto-selected"
            disabled
          />
        </el-form-item>

        <el-form-item label="Position" prop="position">
          <el-select
            v-model="form.position"
            placeholder="Select position"
            clearable
          >
            <el-option
              v-for="pos in filteredPositions"
              :key="pos._id"
              :label="pos.title"
              :value="pos._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Salary" prop="salary">
          <el-input-number
            v-model="form.salary"
            placeholder="Enter salary"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="Hire Date" prop="hire_date">
          <el-date-picker
            v-model="form.hire_date"
            type="date"
            placeholder="Select hire date"
          />
        </el-form-item>

        <el-form-item label="Address" prop="address">
          <el-input
            v-model="form.address"
            placeholder="Enter address"
            clearable
          />
        </el-form-item>

        <el-form-item label="Image" prop="imageUrls">
          <div class="flex flex-col items-end">
            <input
              type="file"
              ref="fileInput"
              @change="handleChange"
              class="w-full"
            />
            <el-button
              type="primary"
              size="mini"
              @click="handleUpload"
              v-if="file"
              class="mt-2"
            >
              Upload
              <el-icon class="el-icon--right">
                <Upload />
              </el-icon>
            </el-button>

            <div v-if="form.imageUrls" class="relative w-full max-w-xs mt-4">
              <div class="relative group w-32 h-32">
                <img
                  :src="form.imageUrls"
                  alt="Uploaded Image"
                  class="w-full h-full object-cover rounded-lg shadow border border-gray-200 transition duration-300 ease-in-out group-hover:opacity-80"
                />
                <el-button
                  size="mini"
                  circle
                  :icon="Delete"
                  @click="removeImageUrl"
                  class="absolute top-2 right-2 bg-white text-gray-500 hover:text-red-500 hover:bg-gray-100 shadow group-hover:opacity-100 opacity-0 transition duration-300 ease-in-out"
                />
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
            @click="confirmDelete"
            class="w-28"
          >
            Delete
          </el-button>
          <el-button @click="resetForm" class="w-28">Reset</el-button>
        </div>
      </el-form-item>
    </el-dialog>

    <el-table
      :data="filteredTableData"
      style="width: 99%"
      border
      stripe
      class="mr-1 modern-table"
      v-loading="loading"
    >
      <el-table-column type="index" label="#" width="46" align="center" />
      <el-table-column prop="name" label="Employee Name" />
      <el-table-column label="Division">
        <template #default="scope">
          {{ getDivisionName(scope.row.division_id) }}
        </template>
      </el-table-column>
      <el-table-column label="Department">
        <template #default="scope">
          {{ getDepartmentName(scope.row.department_id) }}
        </template>
      </el-table-column>
      <el-table-column label="Position">
        <template #default="scope">
          {{ getPositionTitle(scope.row.position) }}
        </template>
      </el-table-column>
      <el-table-column prop="salary" label="Salary" />
      <el-table-column label="Hire Date">
        <template #default="scope">
          {{ formatDate(scope.row.hire_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="address" label="Address" />

      <!-- New Image Column -->
      <el-table-column label="Person" width="">
        <template #default="scope">
          <div class="flex justify-center">
            <img
              v-if="scope.row.imageUrls"
              :src="scope.row.imageUrls"
              alt="Employee Image"
              class="w-12 h-12 object-cover rounded"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Actions">
        <template #header>
          <el-input
            v-model="actionSearch"
            size="small"
            placeholder="Search name"
            clearable
            @input="onSearch"
          />
        </template>
        <template #default="scope">
          <div v-if="matchesActionSearch(scope.row)" class="flex space-x-2">
            <el-button
              size="small"
              type="info"
              plain
              @click="editEmployee(scope.row)"
            >
              Edit
            </el-button>
            <el-button
              size="small"
              plain
              type="danger"
              @click="confirmDelete(scope.row)"
            >
              Delete
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>


<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { ElNotification, ElMessageBox } from "element-plus";
import { Meteor } from "meteor/meteor";
import { Delete, Upload } from "@element-plus/icons-vue";
import FilesCollection from "/imports/api/files/files";

interface Department {
  _id: string;
  name: string;
}

interface Division {
  _id: string;
  name: string;
  department_id: string;
}

interface Position {
  _id: string;
  name: string;
  title: string;
}

interface Employee {
  _id?: string;
  department_id: string;
  division_id: string;
  name: string;
  position: string;
  salary: number;
  hire_date: Date | null;
  address: string;
  imageUrls?: [];
}

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref<any>();

const form = ref<Employee>({
  department_id: "",
  division_id: "",
  name: "",
  position: "",
  salary: 0,
  hire_date: null,
  address: "",
  imageUrls: [],
});

const dataTable = ref<Employee[]>([]);
const departments = ref<Department[]>([]);
const divisions = ref<Division[]>([]);
const positions = ref<Position[]>([]);
const actionSearch = ref("");
const searchTerm = ref("");

const file = ref<File | null>(null);
const fileData = ref<any[]>([]);

const filteredTableData = computed(() => {
  return dataTable.value.filter((emp) =>
    emp.name.toLowerCase().includes(actionSearch.value.toLowerCase())
  );
});

const matchesActionSearch = (row: Employee) => {
  return row.name.toLowerCase().includes(actionSearch.value.toLowerCase());
};

const rules = {
  division_id: [
    { required: true, message: "Division is required", trigger: "change" },
  ],
  name: [
    { required: true, message: "Employee name is required", trigger: "blur" },
  ],
  position: [
    { required: true, message: "Position is required", trigger: "change" },
  ],
  salary: [
    { required: true, message: "Salary is required", trigger: "blur" },
  ],
  hire_date: [
    { required: true, message: "Hire date is required", trigger: "change" },
  ],
  address: [
    { required: true, message: "Address is required", trigger: "blur" },
  ],
};


const notify = (message: string, type: "success" | "error" | "info") => {
  ElNotification({
    message,
    type,
    duration: 2000,
  });
};

const openEmployeeDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

const editEmployee = (emp: Employee) => {
  form.value = { ...emp };
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
    const methodName = form.value._id ? "updateEmployee" : "insertEmployee";
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

const removeEmployeeById = (empId: string | undefined) => {
  if (!empId) return;
  loading.value = true;
  Meteor.call("deleteEmployee", { _id: empId }, (err: Error) => {
    loading.value = false;
    if (err) {
      notify(`Delete failed: ${err.message}`, "error");
    } else {
      notify("Employee deleted successfully", "success");
      getData();
    }
  });
};

const confirmDelete = (emp: Employee) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete employee "${emp.name}"?`,
    "Confirmation",
    {
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      type: "warning",
    }
  )
    .then(() => {
      removeEmployeeById(emp._id);
    })
    .catch(() => {
      notify("Delete canceled", "info");
    });
};

const resetForm = () => {
  refForm.value?.resetFields();
  form.value = {
    department_id: "",
    division_id: "",
    name: "",
    position: "",
    salary: 0,
    hire_date: null,
    address: "",
    imageUrls: null,
  };
  delete form.value._id;
};

const getData = () => {
  loading.value = true;
  Meteor.call("fetchEmployees", (err: Error, res: Employee[]) => {
    loading.value = false;
    if (err) {
      notify(`Failed to fetch employees: ${err.message}`, "error");
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

const getDivisions = () => {
  Meteor.call("fetchDivisions", (err: Error, res: Division[]) => {
    if (err) {
      notify(`Failed to fetch divisions: ${err.message}`, "error");
    } else {
      divisions.value = res;
    }
  });
};

const getPositions = () => {
  Meteor.call("fetchPositions", (err: Error, res: Position[]) => {
    if (err) {
      notify(`Failed to fetch positions: ${err.message}`, "error");
    } else {
      positions.value = res;
    }
  });
};

const filteredPositions = computed(() => {
  return positions.value.filter(pos => pos.division_id === form.value.division_id);
});

const handleDivisionChange = (divisionId: string) => {
  const selectedDiv = divisions.value.find((d) => d._id === divisionId);
  if (selectedDiv) {
    form.value.department_id = selectedDiv.department_id;
  }
};

const getDivisionName = (id: string) => {
  const division = divisions.value.find((d) => d._id === id);
  return division ? division.name : "";
};

const formatDate = (date: Date | string | null): string => {
  if (!date) return "";
  return new Date(date).toDateString();
};

const getDepartmentName = (id: string) => {
  const department = departments.value.find((d) => d._id === id);
  return department ? department.name : "";
};

const getPositionTitle = (positionId: string) => {
  const position = positions.value.find((p) => p._id === positionId);
  return position ? position.title : "";
};

const onSearch = () => {
  loading.value = true;
  Meteor.call(
    "searchEmployees",
    { searchTerm: searchTerm.value },
    (err: Error, res: Employee[]) => {
      loading.value = false;
      if (err) {
        notify(`Failed to search employees: ${err.message}`, "error");
      } else {
        dataTable.value = res;
      }
    }
  );
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
      form.value.imageUrls = fileId;

      ElNotification.success({
        title: "Upload Successful",
        message: "File has been uploaded successfully!",
        duration: 3000,
      });

      getFileUploads();

      file.value = null;
      if ($refs.fileInput) $refs.fileInput.value = null;
    }
  });
};

const handleChange = (e: Event) => {
  if (form.value.imageUrls) {
    ElNotification.warning({
      title: "Action Required",
      message: "Please remove the existing image before selecting a new file.",
    });
    return;
  }

  const target = e.target as HTMLInputElement;
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

const getFileUploads = () => {
  Meteor.call("findImageData", (err: Error, res: any[]) => {
    if (!err) {
      fileData.value = res;
      const uploadedFile = res.find(
        (file) => file._id === form.value.imageUrls
      );
      if (uploadedFile && uploadedFile.url) {
        form.value.imageUrls = uploadedFile.url;
      }
    }
  });
};

const removeFileFromServer = (id: string) => {
  if (!id) return;

  FilesCollection.remove({ _id: id }, (err: Error) => {
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
  if (form.value.imageUrls) {
    const fileToRemove = fileData.value.find(
      (file) => file.url === form.value.imageUrls
    );
    if (fileToRemove && fileToRemove._id) {
      removeFileFromServer(fileToRemove._id);
    }
    form.value.imageUrls = null;

    // Reset file input
    file.value = null;
    if ($refs.fileInput) $refs.fileInput.value = null;
  }
};

onMounted(() => {
  getDepartments();
  getDivisions();
  getPositions();
  getData();
  getFileUploads();
});
</script>

<style scoped>
.upload-demo {
  display: flex;
  flex-wrap: wrap;
}
</style>
