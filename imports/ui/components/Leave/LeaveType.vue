<template>
  <div>
    <!-- Add LeaveType Button -->
    <el-button type="info" plain @click="openLeaveTypeDialog" class="mb-4">
      Manage Leave Type
    </el-button>

    <!-- LeaveType Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="form._id ? 'Edit Leave Type' : 'Add Leave Type'"
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
        @submit.prevent="onSubmit"
      >
        <el-form-item label="Type Name" prop="type_name">
          <el-input
            v-model="form.type_name"
            placeholder="Enter leave type name"
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

    <!-- LeaveTypes Table -->
    <el-table
      :data="leaveTypes"
      style="width: 100%"
      border
      stripe
      class="modern-table"
      v-loading="loading"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="type_name" label="Type Name" />
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button
            size="small"
            type="info"
            plain
            @click="editLeaveType(scope.row)"
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

<script>
import { ref, onMounted } from "vue";
import { Meteor } from "meteor/meteor";
import { ElNotification, ElMessageBox } from "element-plus";

// export default{
//   setup(){

//   }
// return {
  // data
  // methods
  // lifecycle hooks
// };
// }
export default {
  setup() {
    const dialogVisible = ref(false);
    const loading = ref(false);
    const loadingForm = ref(false);
    const formRef = ref(null);
    const form = ref({
      type_name: "",
    });
    const leaveTypes = ref([]);

    // Validation rules for the form.
    const rules = {
      type_name: [
        { required: true, message: "Type name is required", trigger: "blur" },
      ],
    };

    const notify = (message, type) => {
      ElNotification({
        message,
        type,
        duration: 2000,
      });
    };

    const openLeaveTypeDialog = () => {
      resetForm();
      dialogVisible.value = true;
    };

    const editLeaveType = (leaveType) => {
      form.value = { ...leaveType };
      dialogVisible.value = true;
    };

    const onSubmit = () => {
      loadingForm.value = true;
      formRef.value.validate((valid) => {
        if (!valid) {
          loadingForm.value = false;
          notify("Validation failed", "error");
          return;
        }
        const methodName = form.value._id
          ? "updateLeaveType"
          : "insertLeaveType";
        const { created_at, updated_at, ...submitData } = form.value;
        Meteor.call(methodName, { ...submitData }, (err) => {
          loadingForm.value = false;
          if (err) {
            notify(`Operation failed: ${err.message}`, "error");
          } else {
            notify(
              form.value._id ? "Updated successfully" : "Added successfully",
              "success"
            );
            resetForm();
            getLeaveTypes();
            dialogVisible.value = false;
          }
        });
      });
    };

    const confirmDelete = (leaveType) => {
      ElMessageBox.confirm(
        `Are you sure you want to delete leave type "${leaveType.type_name}"?`,
        "Confirmation",
        {
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          type: "warning",
        }
      )
        .then(() => {
          deleteLeaveType(leaveType._id);
        })
        .catch(() => {
          notify("Delete canceled", "info");
        });
    };

    const deleteLeaveType = (_id) => {
      if (!_id) return;
      loading.value = true;
      Meteor.call("deleteLeaveType", { _id }, (err) => {
        loading.value = false;
        if (err) {
          notify(`Delete failed: ${err.message}`, "error");
        } else {
          notify("Deleted successfully", "success");
          getLeaveTypes();
        }
      });
    };

    const resetForm = () => {
      formRef.value?.resetFields();
      form.value = {
        type_name: "",
      };
      delete form.value._id;
    };

    const getLeaveTypes = () => {
      loading.value = true;
      Meteor.call("fetchLeaveTypes", (err, res) => {
        loading.value = false;
        if (err) {
          notify(`Failed to fetch leave types: ${err.message}`, "error");
        } else {
          leaveTypes.value = res;
        }
      });
    };

    onMounted(() => {
      getLeaveTypes();
    });

    return {
      dialogVisible,
      loading,
      loadingForm,
      formRef,
      form,
      leaveTypes,
      rules,
      openLeaveTypeDialog,
      editLeaveType,
      onSubmit,
      confirmDelete,
      deleteLeaveType,
      resetForm,
      getLeaveTypes,
    };
  },
};
</script>

<style scoped>
/* Optional additional styling */
</style>
