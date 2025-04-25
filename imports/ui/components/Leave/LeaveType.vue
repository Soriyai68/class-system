<template>
<<<<<<< HEAD
  <div class="py-12 px-4 sm:px-6 md:px-8">
    <div class="mx-auto bg-white shadow-xl overflow-hidden rounded-2xl" style="max-width: 100%">
      <div class="text-gray-800 p-6 sm:p-8 md:p-10">
        <!-- Header with Button and Search -->
        <div class="flex flex-col sm:flex-row gap-6 mb-8 items-center justify-between">
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
            Leave Type Management
          </h1>
          <input
            v-model="searchQuery"
            class="w-full sm:w-1/3 border border-stone-300 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all duration-200 shadow-sm"
            placeholder="Search leave types..."
          />
        </div>

        <!-- Add Leave Type Button -->
        <div class="mb-8">
          <button
            @click="openLeaveTypeDialog"
            class="group relative w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-300"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-amber-400 group-hover:text-amber-300 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </span>
            Add New Leave Type
          </button>
        </div>

        <!-- LeaveType Dialog -->
        <div v-if="dialogVisible" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
            <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div class="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 class="text-2xl font-semibold text-gray-900" id="modal-title">
                      {{ editingLeaveType ? "Edit Leave Type" : "Add Leave Type" }}
                    </h3>
                    <div class="mt-4">
                      <form @submit.prevent="onSubmit">
                        <div class="mb-4">
                          <label for="leaveTypeName" class="block text-gray-700 text-sm font-bold mb-2">
                            Leave Type Name
                          </label>
                          <input
                            type="text"
                            id="leaveTypeName"
                            v-model="form.type_name"
                            class="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter leave type name"
                          />
                        </div>
                        <div class="mt-6 flex justify-end gap-4">
                          <button type="button" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:scale-105" @click="dialogVisible = false">
                            Cancel
                          </button>
                          <button type="submit" class="bg-amber-500 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
                            {{ editingLeaveType ? "Update" : "Add" }}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LeaveTypes Table -->
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-xl">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="leaveType in filteredLeaveTypes" :key="leaveType._id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ leaveType.type_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="editLeaveType(leaveType)" class="text-indigo-600 hover:text-indigo-900 mr-4">
                    Edit
                  </button>
                  <button @click="confirmDelete(leaveType)" class="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <canvas id="myChart" style="width:100%;max-width:600px"></canvas>
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
  </div>
</template>

<script>
<<<<<<< HEAD
import { Meteor } from "meteor/meteor";
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  setup() {
    const dialogVisible = ref(false);
    const searchQuery = ref("");
    const leaveTypes = ref([]);
    const editingLeaveType = ref(null);
    const form = reactive({
      type_name: "",
    });

    const filteredLeaveTypes = computed(() => {
      if (!searchQuery.value) return leaveTypes.value;
      return leaveTypes.value.filter((leaveType) =>
        leaveType.type_name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const openLeaveTypeDialog = () => {
      editingLeaveType.value = null;
      form.type_name = "";
      dialogVisible.value = true;
    };

    const fetchLeaveTypes = async () => {
      try {
        const result = await Meteor.callAsync("fetchLeaveTypes");
        leaveTypes.value = result;
      } catch (error) {
        ElMessage.error(`Failed to fetch leave types: ${error.reason || error.message}`);
      }
    };

    const insertLeaveType = async (leaveType) => {
      try {
        await Meteor.callAsync("insertLeaveType", leaveType);
        ElMessage.success("Leave type added successfully");
        await fetchLeaveTypes();
      } catch (error) {
        ElMessage.error(`Failed to insert leave type: ${error.reason || error.message}`);
      }
    };

    const updateLeaveType = async (leaveType) => {
      try {
        await Meteor.callAsync("updateLeaveType", leaveType);
        ElMessage.success("Leave type updated successfully");
        await fetchLeaveTypes();
      } catch (error) {
        ElMessage.error(`Failed to update leave type: ${error.reason || error.message}`);
      }
    };

    const deleteLeaveType = async (_id) => {
      try {
        await Meteor.callAsync("deleteLeaveType", { _id });
        ElMessage.success("Leave type deleted successfully");
        await fetchLeaveTypes();
      } catch (error) {
        ElMessage.error(`Failed to delete leave type: ${error.reason || error.message}`);
      }
    };

    const editLeaveType = (leaveType) => {
      editingLeaveType.value = leaveType;
      form.type_name = leaveType.type_name;
      dialogVisible.value = true;
    };

    const confirmDelete = (leaveType) => {
      ElMessageBox.confirm(
        "Are you sure you want to delete this leave type?",
        "Warning",
        {
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(() => deleteLeaveType(leaveType._id))
        .catch(() => {});
    };

    const onSubmit = async () => {
      if (editingLeaveType.value) {
        await updateLeaveType({
          _id: editingLeaveType.value._id,
          type_name: form.type_name,
        });
      } else {
        await insertLeaveType({ type_name: form.type_name });
      }
      dialogVisible.value = false;
    };

    onMounted(async () => {
      await fetchLeaveTypes();
      const xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
      const yValues = [55, 49, 44, 24, 15];
      const barColors = ["#b91d47", "#00aba9", "#2b5797", "#e8c3b9", "#1e7145"];

      new Chart("myChart", {
        type: "pie",
        data: {
          labels: xValues,
          datasets: [{
            backgroundColor: barColors,
            data: yValues,
          }],
        },
        options: {
          title: {
            display: true,
            text: "World Wide Wine Production 2018",
          },
        },
      });
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
    });

    return {
      dialogVisible,
<<<<<<< HEAD
      searchQuery,
      leaveTypes,
      filteredLeaveTypes,
      openLeaveTypeDialog,
      fetchLeaveTypes,
      insertLeaveType,
      updateLeaveType,
      deleteLeaveType,
      editLeaveType,
      confirmDelete,
      onSubmit,
      editingLeaveType,
      form,
=======
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
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
    };
  },
};
</script>

<style scoped>
/* Optional additional styling */
<<<<<<< HEAD
</style>
=======
</style>
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
