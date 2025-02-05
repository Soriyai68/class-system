<template>
  <div>
    <el-button type="info" plain @click="openStudentDialog" class="mb-4">
      បន្ថែមសិស្ស
    </el-button>

    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'កែសម្រួលសិស្ស' : 'បន្ថែមសិស្ស'"
      width="500px"
      center
      :close-on-click-modal="true"
    >
      <el-form
        :model="form"
        ref="refForm"
        :rules="rules"
        label-width="100px"
        size="default"
        v-loading="loadingForm"
      >
        <el-form-item label="នាមត្រកូល" prop="last_name">
          <el-input
            v-model="form.last_name"
            placeholder="បញ្ចូលនាមត្រកូល"
            clearable
          />
        </el-form-item>
        <el-form-item label="នាមខ្លួន" prop="first_name">
          <el-input
            v-model="form.first_name"
            placeholder="បញ្ចូលនាមខ្លួន"
            clearable
          />
        </el-form-item>

        <el-form-item label="អ៊ីម៉ែល" prop="email">
          <el-input
            v-model="form.email"
            placeholder="បញ្ចូលអ៊ីម៉ែល"
            clearable
          />
        </el-form-item>

        <el-form-item label="ទូរស័ព្ទ" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="បញ្ចូលទូរស័ព្ទ"
            clearable
          />
        </el-form-item>

        <el-form-item label="ថ្ងៃខែឆ្នាំកំណើត" prop="date_of_birth">
          <el-date-picker
            v-model="form.date_of_birth"
            type="date"
            placeholder="ជ្រើសរើសថ្ងៃកំណើត"
            format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>

        <el-form-item label="អាសយដ្ឋាន" prop="address">
          <el-input
            v-model="form.address"
            placeholder="បញ្ចូលអាសយដ្ឋាន"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <div class="flex justify-between space-x-2">
            <el-button
              type="primary"
              :loading="loadingForm"
              @click="onSubmit"
              class="w-28"
            >
              {{ form._id ? "ធ្វើបច្ចុប្បន្នភាព" : "បន្ថែម" }}
            </el-button>
            <el-button
              v-if="form._id"
              type="danger"
              plain
              @click="removeStudent"
              class="w-28"
            >
              លុប
            </el-button>
            <el-button @click="resetForm" class="w-28"> កំណត់សំរាប់ </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-table
      :data="dataTable"
      style="width: 99%"
      border
      stripe
      v-loading="loading"
    >
      <el-table-column type="index" label="លេខ" width="60" />
      <el-table-column prop="first_name" label="នាមខ្លួន" />
      <el-table-column prop="last_name" label="នាមត្រកូល" />
      <el-table-column prop="email" label="អ៊ីម៉ែល" />
      <el-table-column prop="phone" label="ទូរស័ព្ទ" />
      <el-table-column prop="date_of_birth" label="ថ្ងៃកំណើត">
        <template #default="scope">
          {{ formatDate(scope.row.date_of_birth) }}
        </template>
      </el-table-column>

      <el-table-column prop="address" label="អាសយដ្ឋាន" />
      <el-table-column label="សកម្មភាព">
        <template #default="scope">
          <el-button
            size="small"
            type="info"
            plain
            @click="editStudent(scope.row)"
          >
            កែសម្រួល
          </el-button>
          <el-button
            size="small"
            plain
            type="danger"
            @click="confirmDelete(scope.row)"
          >
            លុប
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import { ElMessageBox } from "element-plus";
type StudentType = {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: Date;
  address?: string;
};

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref();
const form = ref<StudentType>({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
});
const dataTable = ref<StudentType[]>([]);

const rules = {
  first_name: [
    { required: true, message: "នាមខ្លួនគឺមានតំលៃ", trigger: "blur" },
  ],
  last_name: [
    { required: true, message: "នាមត្រកូលគឺមានតំលៃ", trigger: "blur" },
  ],
  email: [{ required: true, message: "អ៊ីម៉ែលគឺមានតំលៃ", trigger: "blur" }],
  phone: [{ required: true, message: "ទូរស័ព្ទគឺមានតំលៃ", trigger: "blur" }],
};

const notify = (message: string, type: "success" | "error") => {
  ElNotification({
    message,
    type,
    duration: 2000,
  });
};

const openStudentDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

const editStudent = (student: StudentType) => {
  form.value = { ...student };
  centerDialogVisible.value = true;
};
const formatDate = (date: string | Date) => {
  return date ? new Date(date).toDateString() : "-";
};

const onSubmit = () => {
  loadingForm.value = true;
  refForm.value.validate((valid: boolean) => {
    if (!valid) {
      loadingForm.value = false;
      notify("ការពិនិត្យមិនបានជោគជ័យ", "error");
      return;
    }

    const methodName = form.value._id ? "updateStudent" : "insertStudents";
    Meteor.call(methodName, { ...form.value }, (err: Error) => {
      loadingForm.value = false;
      if (err) {
        console.error("Error:", err);
        notify("ប្រតិបត្តិការមិនបានជោគជ័យ", "error");
      } else {
        notify(
          form.value._id ? "ធ្វើបច្ចុប្បន្នភាពបានជោគជ័យ" : "បានបន្ថែមដោយជោគជ័យ",
          "success"
        );
        resetForm();
        getData();
        centerDialogVisible.value = false;
      }
    });
  });
};

const removeStudent = () => {
  loadingForm.value = true;
  Meteor.call("deleteStudent", { _id: form.value._id }, (err: Error) => {
    loadingForm.value = false;
    if (err) {
      notify("ការលុបមិនបានជោគជ័យ", "error");
    } else {
      notify("បានលុបដោយជោគជ័យ", "success");
      resetForm();
      getData();
      centerDialogVisible.value = false;
    }
  });
};

const resetForm = () => {
  refForm.value?.resetFields();
  form.value = { first_name: "", last_name: "", email: "", phone: "" };
  delete form.value._id;
};

const getData = () => {
  loading.value = true;
  Meteor.call("fetchStudents", (err: Error, res: StudentType[]) => {
    loading.value = false;
    if (err) {
      notify("មិនអាចទាញយកទិន្នន័យបាន", "error");
    } else {
      dataTable.value = res;
    }
  });
};
const confirmDelete = (student: StudentType) => {
  ElMessageBox.confirm(
    `តើអ្នកប្រាកដជាចង់លុបសិស្សឈ្មោះ ${student.first_name} ${student.last_name} មែនទេ?`,
    "ការបញ្ជាក់",
    {
      confirmButtonText: "បាទ/ចាស",
      cancelButtonText: "ទេ",
      type: "warning",
    }
  )
    .then(() => {
      removeStudentById(student._id);
    })
    .catch(() => {
      notify("ការលុបត្រូវបានបោះបង់", "info");
    });
};

const removeStudentById = (studentId: string) => {
  loading.value = true;
  Meteor.call("deleteStudent", { _id: studentId }, (err: Error) => {
    loading.value = false;
    if (err) {
      notify("ការលុបមិនបានជោគជ័យ", "error");
    } else {
      notify("បានលុបដោយជោគជ័យ", "success");
      getData();
    }
  });
};

onMounted(() => {
  getData();
});
</script>
