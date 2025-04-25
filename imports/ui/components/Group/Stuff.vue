<template>
  <div class="p-4">
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-4">Attendance Statistics</h2>
      
      <!-- Date Range Selector -->
      <div class="flex gap-4 mb-6">
        <v-date-picker v-model="startDate" class="w-48" placeholder="Start Date" />
        <v-date-picker v-model="endDate" class="w-48" placeholder="End Date" />
        <v-btn @click="fetchDateRangeStats" color="primary">Apply Filter</v-btn>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <v-card>
          <v-card-text>
            <div class="text-lg font-semibold">Total Employees</div>
            <div class="text-3xl">{{ totalEmployees }}</div>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-text>
            <div class="text-lg font-semibold">Present Today</div>
            <div class="text-3xl text-green-600">{{ presentToday }}</div>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-text>
            <div class="text-lg font-semibold">Absent Today</div>
            <div class="text-3xl text-red-600">{{ absentToday }}</div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Department Stats Table -->
      <v-card class="mb-6">
        <v-card-title>Department Statistics</v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Staff</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dept in departmentStats" :key="dept._id.department_id">
                <td>{{ dept.departmentName }}</td>
                <td>{{ dept.totalAttendances }}</td>
                <td class="text-green-600">{{ dept.presentCount }}</td>
                <td class="text-red-600">{{ dept.absentCount }}</td>
                <td>{{ calculateRate(dept.presentCount, dept.totalAttendances) }}%</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <!-- Employee Attendance Table -->
      <v-card>
        <v-card-title>Employee Attendance Details</v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Total Days</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in employeeStats" :key="record.employee_id">
                <td>{{ record.employee[0]?.name || 'N/A' }}</td>
                <td>{{ record.totalDays }}</td>
                <td class="text-green-600">{{ record.presentDays }}</td>
                <td class="text-red-600">{{ record.absentDays }}</td>
                <td>{{ record.attendanceRate.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTracker } from 'meteor/vue-meteor-tracker';

const startDate = ref(new Date());
const endDate = ref(new Date());
const employeeStats = ref([]);
const departmentStats = ref([]);
const totalEmployees = ref(0);
const presentToday = ref(0);
const absentToday = ref(0);

const fetchDateRangeStats = async () => {
  try {
    const result = await Meteor.call('attendance.getDateRangeStats', startDate.value, endDate.value);
    const today = result.find(r => 
      new Date(r._id.date).toDateString() === new Date().toDateString()
    );
    if (today) {
      presentToday.value = today.presentEmployees;
      absentToday.value = today.absentEmployees;
    }
  } catch (error) {
    console.error('Error fetching date range stats:', error);
  }
};

const fetchDepartmentStats = async () => {
  try {
    const result = await Meteor.call('attendance.getDepartmentStats');
    departmentStats.value = result;
  } catch (error) {
    console.error('Error fetching department stats:', error);
  }
};

const fetchEmployeeStats = async () => {
  try {
    const result = await Meteor.call('attendance.getGroupedStats');
    employeeStats.value = result;
    totalEmployees.value = result.length;
  } catch (error) {
    console.error('Error fetching employee stats:', error);
  }
};

const calculateRate = (present, total) => {
  if (!total) return 0;
  return ((present / total) * 100).toFixed(2);
};

onMounted(() => {
  fetchDateRangeStats();
  fetchDepartmentStats();
  fetchEmployeeStats();
});
</script>

<style scoped>
.v-table {
  width: 100%;
  border-collapse: collapse;
}

.v-table th,
.v-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.v-table th {
  background-color: #f8fafc;
  font-weight: 600;
}
</style>