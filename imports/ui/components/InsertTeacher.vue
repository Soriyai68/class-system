<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    align-center
    :close-on-click-modal="true"
    append-to-body
  >
    <el-form
      ref="formRef"
      :model="teacherForm"
      :rules="rules"
      label-width="auto"
      class="max-w-xl mx-auto"
      align="center"
    >
      <el-form-item label="ឈ្មោះដំបូង" prop="first_name">
        <el-input v-model="teacherForm.first_name" />
      </el-form-item>

      <el-form-item label="ឈ្មោះក្រោយ" prop="last_name">
        <el-input v-model="teacherForm.last_name" />
      </el-form-item>

      <el-form-item label="អ៊ីមែល" prop="email">
        <el-input v-model="teacherForm.email" />
      </el-form-item>

      <el-form-item label="លេខទូរស័ព្ទ" prop="phone">
        <el-input v-model="teacherForm.phone" />
      </el-form-item>

      <el-form-item label="មុខវិជ្ជា" prop="subject">
        <el-input v-model="teacherForm.subject" />
      </el-form-item>

      <el-form-item>
        <el-button type="info" plain @click="submitForm">{{
          dialogButtonLabel
        }}</el-button>
        <el-button @click="resetForm">កំណត់ឡើងវិញ</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-button type="info" plain @click="openDialog">បន្ថែមគ្រូ</el-button>

  <!-- Teachers Table with Search -->
  <el-table
    :data="filterTableData"
    style="width: 99%"
    class="mt-4 shadow-lg rounded-lg overflow-hidden"
  >
    <el-table-column label="ឈ្មោះដំបូង" prop="first_name" />
    <el-table-column label="ឈ្មោះក្រោយ" prop="last_name" />
    <el-table-column label="អ៊ីមែល" prop="email" />
    <el-table-column label="លេខទូរស័ព្ទ" prop="phone" />
    <el-table-column label="មុខវិជ្ជា" prop="subject" />
    <el-table-column label="សកម្មភាព">
      <template #header>
        <el-input
          v-model="search"
          size="small"
          placeholder="Type to search"
          class="w-full"
        />
      </template>
      <template #default="scope">
        <el-button
          size="small"
          @click="updateTeacher(scope.row)"
          type="primary"
          plain
          class="mr-2"
          >កែសម្រួល</el-button
        >
        <el-button
          size="small"
          plain
          type="danger"
          @click="deleteTeacher(scope.row._id)"
          >លុប</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";

const formRef = ref();
const dialogVisible = ref(false);
const teachers = ref([]);
const search = ref("");

// Teacher form model
const teacherForm = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  subject: "",
});

const rules = {
  first_name: [
    { required: true, message: "សូមបញ្ចូលឈ្មោះដំបូង", trigger: "blur" },
  ],
  last_name: [
    { required: true, message: "សូមបញ្ចូលឈ្មោះក្រោយ", trigger: "blur" },
  ],
  phone: [{ required: true, message: "សូមបញ្ចូលលេខទូរស័ព្ទ", trigger: "blur" }],
  subject: [{ required: true, message: "សូមបញ្ចូលមុខវិជ្ជា", trigger: "blur" }],
};

const dialogTitle = ref("បន្ថែមគ្រូ");
const dialogButtonLabel = ref("បញ្ជូន");
let currentTeacherId = null;

// Computed filtered table data based on the search query
const filterTableData = computed(() =>
  teachers.value.filter(
    (teacher) =>
      !search.value ||
      teacher.first_name.toLowerCase().includes(search.value.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(search.value.toLowerCase()) ||
      teacher.email.toLowerCase().includes(search.value.toLowerCase()) ||
      teacher.phone.toLowerCase().includes(search.value.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(search.value.toLowerCase())
  )
);

const openDialog = () => {
  teacherForm.first_name = "";
  teacherForm.last_name = "";
  teacherForm.email = "";
  teacherForm.phone = "";
  teacherForm.subject = "";
  dialogTitle.value = "បន្ថែមគ្រូ";
  dialogButtonLabel.value = "បញ្ជូន";
  currentTeacherId = null;
  dialogVisible.value = true;
};

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (currentTeacherId) {
        Meteor.call(
          "updateTeachers",
          { _id: currentTeacherId, ...teacherForm },
          (error) => {
            if (error) {
              ElMessage.error(
                `បរាជ័យក្នុងការកែសម្រួលគ្រូ: ${error.reason || error.message}`
              );
            } else {
              ElMessage.success("គ្រូបានធ្វើបច្ចុប្បន្នភាពជោគជ័យ!");
              fetchTeachers();
              resetForm();
              dialogVisible.value = false;
            }
          }
        );
      } else {
        Meteor.call("insertTeachers", { ...teacherForm }, (error) => {
          if (error) {
            ElMessage.error(
              `បរាជ័យក្នុងការបញ្ចូលគ្រូ: ${error.reason || error.message}`
            );
          } else {
            ElMessage.success("គ្រូបានបញ្ចូលជោគជ័យ!");
            fetchTeachers();
            resetForm();
            dialogVisible.value = false;
          }
        });
      }
    } else {
      ElMessage.error("សូមបំពេញទីតាំងដែលត្រូវការទាំងអស់។");
    }
  });
};

const resetForm = () => {
  formRef.value.resetFields();
};

const fetchTeachers = () => {
  Meteor.call("fetchTeachers", (error, result) => {
    if (error) {
      ElMessage.error(
        `បរាជ័យក្នុងការទាញយកគ្រូ: ${error.reason || error.message}`
      );
    } else {
      teachers.value = result;
    }
  });
};

const updateTeacher = (teacher) => {
  teacherForm.first_name = teacher.first_name;
  teacherForm.last_name = teacher.last_name;
  teacherForm.email = teacher.email;
  teacherForm.phone = teacher.phone;
  teacherForm.subject = teacher.subject;
  dialogTitle.value = "កែសម្រួលគ្រូ";
  dialogButtonLabel.value = "កែសម្រួល";
  currentTeacherId = teacher._id;
  dialogVisible.value = true;
};

const deleteTeacher = (id) => {
  Meteor.call("deleteTeachers", { _id: id }, (error, result) => {
    if (error) {
      ElMessage.error(
        `បរាជ័យក្នុងការលុបគ្រូ: ${error.reason || error.message}`
      );
    } else {
      ElMessage.success(result.message || "គ្រូបានលុបជោគជ័យ!");
      fetchTeachers();
    }
  });
};

onMounted(() => {
  fetchTeachers();
});
</script>

<style scoped>
.max-w-xl {
  max-width: 600px;
}
.mt-4 {
  margin-top: 1rem;
}

.el-table {
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.el-table th,
.el-table td {
  padding: 12px;
  text-align: center;
}

.el-table th {
  background-color: #f5f5f5;
  color: #333;
  font-weight: bold;
}

.el-table-column {
  padding: 0 1rem;
}

.el-input {
  width: 100%;
}
</style>
