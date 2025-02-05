<template>
  <div>
    <el-button type="info" plain @click="openNewEnrollmentDialog" class="mb-4">
      បន្ថែមការចុះឈ្មោះ
    </el-button>

    <el-dialog
      v-model="centerDialogVisible"
      :title="form._id ? 'កែសម្រួលការចុះឈ្មោះ' : 'បន្ថែមការចុះឈ្មោះ'"
      width="500px"
      center
      :close-on-click-modal="true"
    >
      <el-form
        :model="form"
        ref="refForm"
        :rules="rules"
        label-width="130px"
        size="default"
        v-loading="loadingForm"
      >
        <el-form-item label="សិស្ស" prop="student_id">
          <el-select
            v-model="form.student_id"
            placeholder="ជ្រើសរើសសិស្ស"
            clearable
          >
            <el-option
              v-for="student in students"
              :key="student._id"
              :label="student.fullName"
              :value="student._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="វគ្គសិក្សា" prop="course_id">
          <el-select
            v-model="form.course_id"
            placeholder="ជ្រើសរើសវគ្គសិក្សា"
            clearable
          >
            <el-option
              v-for="course in courses"
              :key="course._id"
              :label="course.course_name"
              :value="course._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="ថ្ងៃចុះឈ្មោះ" prop="enrollment_date">
          <el-date-picker
            v-model="form.enrollment_date"
            type="date"
            placeholder="ជ្រើសរើសថ្ងៃ"
            clearable
          />
        </el-form-item>

        <el-form-item label="តម្លៃសិក្សា" prop="enrollment_cost">
          <el-input-number
            v-model="form.enrollment_cost"
            :min="0"
            placeholder="បញ្ចូលតម្លៃ"
            class="w-full"
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
              @click="remove(form._id)"
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
      <el-table-column label="សិស្ស">
        <template #default="scope">
          {{ getStudentName(scope.row.student_id) }}
        </template>
      </el-table-column>

      <el-table-column label="វគ្គសិក្សា">
        <template #default="scope">
          {{ getCourseName(scope.row.course_id) }}
        </template>
      </el-table-column>

      <el-table-column label="ថ្ងៃចុះឈ្មោះ">
        <template #default="scope">
          {{ formatDate(new Date(scope.row.enrollment_date)) }}
        </template>
      </el-table-column>

      <el-table-column label="តម្លៃសិក្សា">
        <template #default="scope"> {{ scope.row.enrollment_cost }}$ </template>
      </el-table-column>

      <el-table-column label="សកម្មភាព" width="180">
        <template #default="scope">
          <el-button type="primary" plain size="small" @click="edit(scope.row)">
            កែប្រែ
          </el-button>
          <el-button
            type="danger"
            plain
            size="small"
            @click="confirmDelete(scope.row._id)"
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
import { ElNotification, ElMessageBox } from "element-plus";

type FormType = {
  _id?: string;
  student_id: string;
  course_id: string;
  enrollment_date: string | null;
  enrollment_cost: number | null;
};

const centerDialogVisible = ref(false);
const loading = ref(false);
const loadingForm = ref(false);
const refForm = ref();
const form = ref<FormType>({
  student_id: "",
  course_id: "",
  enrollment_date: null,
  enrollment_cost: null,
});
const dataTable = ref<FormType[]>([]);
const students = ref<any[]>([]);
const courses = ref<any[]>([]);

const rules = {
  student_id: [{ required: true, message: "សិស្សគឺមានតំលៃ", trigger: "blur" }],
  course_id: [
    { required: true, message: "វគ្គសិក្សាគឺមានតំលៃ", trigger: "blur" },
  ],
  enrollment_cost: [
    { required: true, message: "តម្លៃចុះឈ្មោះគឺមានតំលៃ", trigger: "blur" },
  ],
};

const notify = (message: string, type: "success" | "error" | "info") => {
  ElNotification({ message, type, duration: 2000 });
};

const openNewEnrollmentDialog = () => {
  resetForm();
  centerDialogVisible.value = true;
};

const edit = (row: FormType) => {
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

    const methodName = form.value._id ? "updateEnrollment" : "insertEnrollment";
    Meteor.call(methodName, { ...form.value }, (err: Error) => {
      loadingForm.value = false;
      if (err) {
        console.error("Error during insert/update:", err);
        notify("វគ្គសិក្សាពេញហើយ", "error");
      } else {
        notify(
          form.value._id
            ? "បានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ"
            : "បានបន្ថែមដោយជោគជ័យ",
          "success"
        );
        resetForm();
        getData();
        centerDialogVisible.value = false;
      }
    });
  });
};

const confirmDelete = (id: string) => {
  ElMessageBox.confirm(
    "តើអ្នកពិតជាចង់លុបការចុះឈ្មោះនេះមែនទេ?",
    "បញ្ជាក់ការលុប",
    {
      confirmButtonText: "បាទ/ចាស",
      cancelButtonText: "ទេ",
      type: "warning",
    }
  )
    .then(() => {
      remove(id);
    })
    .catch(() => {
      notify("បានបោះបង់ការលុប", "info");
    });
};

const remove = (id: string) => {
  loading.value = true;
  Meteor.call("deleteEnrollment", { _id: id }, (err: Error) => {
    loading.value = false;
    if (err) {
      console.error("Error during remove:", err);
      notify("ការលុបមិនបានជោគជ័យ", "error");
    } else {
      notify("បានលុបដោយជោគជ័យ", "success");
      getData();
    }
  });
};

const resetForm = () => {
  refForm.value?.resetFields();
  form.value = {
    student_id: "",
    course_id: "",
    enrollment_date: null,
    enrollment_cost: null,
  };
  delete form.value._id;
};

const getData = () => {
  loading.value = true;
  Meteor.call("fetchEnrollments", (err: Error, res: FormType[]) => {
    loading.value = false;
    if (err) {
      console.error("Error during fetch:", err);
      notify("មិនអាចទាញយកទិន្នន័យបាន", "error");
    } else {
      dataTable.value = res;
    }
  });
};

const getStudents = () => {
  Meteor.call("fetchStudents", (err: Error, res: any[]) => {
    if (err) {
      console.error("Error during fetching students:", err);
    } else {
      students.value = res.map((student) => ({
        ...student,
        fullName: `${student.first_name} ${student.last_name}`,
      }));
    }
  });
};

const getCourses = () => {
  Meteor.call("fetchCourses", (err: Error, res: any[]) => {
    if (err) {
      console.error("Error during fetching courses:", err);
    } else {
      courses.value = res;
    }
  });
};

const getStudentName = (studentId: string): string => {
  const student = students.value.find((s) => s._id === studentId);
  return student ? student.fullName : "សិស្សមិនស្គាល់";
};

const getCourseName = (courseId: string): string => {
  const course = courses.value.find((c) => c._id === courseId);
  return course ? course.course_name : "វគ្គសិក្សាមិនស្គាល់";
};

const formatDate = (date: Date) => {
  return date.toDateString(); // Returns 'Tue Feb 04 2025'
};

onMounted(() => {
  getStudents();
  getCourses();
  getData();
});
</script>
