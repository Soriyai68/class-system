<template>
  <div>
    <el-button type="info" plain @click="openNewItemDialog" class="mb-4">
      បន្ថែមវគ្គសិក្សា
    </el-button>

    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'កែសម្រួលវគ្គសិក្សា' : 'បន្ថែមវគ្គសិក្សា'"
      width="500px"
      center
      :close-on-click-modal="true"
    >
      <el-form
        :model="form"
        ref="refForm"
        :rules="rules"
        label-width="80px"
        size="default"
        v-loading="loadingForm"
      >
        <el-form-item label="វគ្គសិក្សា" prop="course_name">
          <el-input
            v-model="form.course_name"
            placeholder="បញ្ចូលឈ្មោះវគ្គសិក្សា"
            size="default"
            clearable
          />
        </el-form-item>

        <el-form-item label="ពិពណ៌នា" prop="description">
          <el-input
            v-model="form.description"
            placeholder="បញ្ចូលពិពណ៌នាវគ្គសិក្សា"
            size="default"
            clearable
          />
        </el-form-item>

        <!-- Teacher Selection Dropdown -->
        <el-form-item label="គ្រូ" prop="teacher_id">
          <el-select
            v-model="form.teacher_id"
            placeholder="ជ្រើសរើសគ្រូ"
            size="default"
            clearable
          >
            <el-option
              v-for="teacher in teachers"
              :key="teacher._id"
              :label="teacher.fullName"
              :value="teacher._id"
            />
          </el-select>
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
              @click="remove"
              class="w-28"
            >
              លុប
            </el-button>
            <el-button @click="resetForm" class="w-28"> កំណត់សំរាប់ </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-table :data="dataTable" style="width: 99%" border stripe v-loading="loading">
      <el-table-column type="index" label="លេខ" width="60" />
      <el-table-column prop="course_name" label="ឈ្មោះវគ្គសិក្សា">
        <template #default="scope">
          <el-tooltip content="កែសម្រួល" placement="top">
            <span
              class="cursor-pointer text-[#409EFF]"
              @click="edit(scope.row)"
            >
              {{ scope.row.course_name }}
            </span>
          </el-tooltip>
        </template>
      </el-table-column>

      <!-- Teacher column -->
      <el-table-column label="គ្រូ" >
        <template #default="scope">
          <span>{{ getTeacherName(scope.row.teacher_id) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="ពិពណ៌នា" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";

type FormType = {
  _id?: string;
  course_name: string;
  description?: string;
  teacher_id: string;
};

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref();
const form = ref<FormType>({ course_name: "", teacher_id: "" });
const dataTable = ref<FormType[]>([]);
const teachers = ref<any[]>([]);

const rules = {
  course_name: [
    { required: true, message: "ឈ្មោះវគ្គសិក្សាគឺមានតំលៃ", trigger: "blur" },
  ],
  teacher_id: [
    { required: true, message: "គ្រូគឺមានតំលៃ", trigger: "blur" },
  ],
};

const notify = (message: string, type: "success" | "error") => {
  ElNotification({
    message,
    type,
    duration: 2000,
  });
};

const openNewItemDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

const edit = (row: FormType) => {
  // Pre-fill the form with the selected course details for editing
  form.value = { ...row };
  centerDialogVisible.value = true;
};

const onSubmit = () => {
  loadingForm.value = true;
  refForm.value.validate((valid: boolean) => {
    if (!valid) {
      loadingForm.value = false;
      notify("ការពិនិត្យមិនបានជោគជ័យ", "error");
      return;
    }

    // Determine method: update if course has an _id, otherwise insert new course
    const methodName = form.value._id ? "updateCourse" : "insertCourse";
    Meteor.call(methodName, { ...form.value }, (err: Error) => {
      loadingForm.value = false;
      if (err) {
        console.error("Error during insert/update:", err);
        notify("ប្រតិបត្តិការមិនបានជោគជ័យ", "error");
      } else {
        notify(form.value._id ? "បានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ" : "បានបន្ថែមដោយជោគជ័យ", "success");
        resetForm();
        getData();
        centerDialogVisible.value = false;
      }
    });
  });
};

const remove = () => {
  loadingForm.value = true;
  Meteor.call("deleteCourse", { _id: form.value._id }, (err: Error) => {
    loadingForm.value = false;
    if (err) {
      console.error("Error during remove:", err);
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
  form.value = { course_name: "", teacher_id: "" };
  delete form.value._id;
};

const getData = () => {
  loading.value = true;
  Meteor.call("fetchCourses", (err: Error, res: FormType[]) => {
    loading.value = false;
    if (err) {
      console.error("Error during fetch:", err);
      notify("មិនអាចទាញយកទិន្នន័យបាន", "error");
    } else {
      dataTable.value = res;
    }
  });
};

const getTeachers = () => {
  loading.value = true;
  Meteor.call("fetchTeachers", (err: Error, res: any[]) => {
    loading.value = false;
    if (err) {
      console.error("Error during fetching teachers:", err);
      notify("មិនអាចទាញយកគ្រូបាន", "error");
    } else {
      teachers.value = res.map((teacher) => ({
        ...teacher,
        fullName: `${teacher.first_name} ${teacher.last_name}`,
      }));
    }
  });
};

// Helper method to find a teacher's full name based on teacher_id
const getTeacherName = (teacherId: string): string => {
  const teacher = teachers.value.find((t) => t._id === teacherId);
  return teacher ? teacher.fullName : "គ្រូមិនស្គាល់";
};

onMounted(() => {
  // First fetch teachers then courses so that teacher info is available for display.
  getTeachers();
  getData();
});
</script>
