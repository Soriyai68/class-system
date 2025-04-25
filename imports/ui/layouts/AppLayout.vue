<template>
  <el-container
    class="layout-container-demo font-semibold animated-bg h-screen"
  >
    <!-- Background Animation -->
    <BackgroundAnimation />
    <!-- Sidebar -->
    <el-aside
      v-show="!isMobile || isSidebarOpen"
      :width="isMobile ? '200px' : '230px'"
      class="mt-4 rounded-2xl m-2 transition-all duration-300 animated-bg"
    >
      <el-scrollbar class="rounded-3xl">
        <el-menu
          :default-openeds="['0', '10']"
          :collapse="isMobile && !isSidebarOpen"
        >
          <div class="flex justify-center items-center">
            <el-image
              src="/soriya.png"
              alt="Logo"
              fit="contain"
              class="mt-8 rounded"
              style="width: 60%; max-height: 500px"
            ></el-image>
          </div>
          <el-menu-item index="1">
            <router-link to="/">
              <el-icon>
                <user />
              </el-icon>

              Human Resource
            </router-link>
          </el-menu-item>
          <!-- Attendance -->
          <el-sub-menu index="2">
            <template #title>
              <el-icon>
                <calendar />
              </el-icon>
              Attendance
            </template>
            <el-menu-item-group>
              <template #title>Attendance</template>
              <el-menu-item index="2-1">
                <router-link to="/attendance">Attendance</router-link>
              </el-menu-item>
              <el-menu-item index="2-2">
                <router-link to="/reportattendance"
                  >Attendance Reports</router-link
                >
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <!-- Award -->
          <el-sub-menu index="3">
            <template #title>
              <el-icon>
                <star />
              </el-icon>
<<<<<<< HEAD
             Manage Award
=======
              Award
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
            </template>
            <el-menu-item-group>
              <template #title>Award</template>
              <el-menu-item index="3-1"
<<<<<<< HEAD
                ><router-link to="/award">Manage Award</router-link></el-menu-item
=======
                ><router-link to="/award">New Award</router-link></el-menu-item
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
              >
            </el-menu-item-group>
          </el-sub-menu>
          <!-- Recruitment -->
          <el-sub-menu index="4">
            <template #title>
              <el-icon>
                <UserFilled />
              </el-icon>
              Recruitment
            </template>
            <el-menu-item-group>
              <template #title>Recruitment</template>
              <el-menu-item index="4-1"
                ><router-link to="/cadidate"
<<<<<<< HEAD
                  >Manage Candidate</router-link
                ></el-menu-item
              >
              <!-- <el-menu-item index="4-2">Manage Candidate</el-menu-item> -->
=======
                  >New Candidate</router-link
                ></el-menu-item
              >
              <el-menu-item index="4-2">Manage Candidate</el-menu-item>
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
              <el-menu-item index="4-2.1">
                <router-link to="/shortlist"> Candidate Shortlist </router-link>
              </el-menu-item>
              <el-menu-item index="4-2.2"
                ><router-link to="/interview"
                  >Interview</router-link
                ></el-menu-item
              >
              <el-menu-item index="4-2.3">
                <router-link to="/selectcandidate"
                  >Select Candidate</router-link
                >
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>

          <!-- Department -->
          <el-sub-menu index="5">
            <template #title>
              <el-icon>
                <office-building />
              </el-icon>
              Department
            </template>
            <el-menu-item-group>
              <template #title>Department</template>
              <el-menu-item index="5-1">
                <router-link to="/department">Add Department</router-link>
              </el-menu-item>
              <el-menu-item index="5-2">
                <router-link to="/division">Add Division</router-link>
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>

          <!-- Employee -->
          <el-sub-menu index="6">
            <template #title>
              <el-icon>
                <User />
              </el-icon>
              Employee
            </template>
            <el-menu-item-group>
              <template #title>Employee</template>
              <el-menu-item index="6-1"
                ><router-link to="/position"
                  >Position</router-link
                ></el-menu-item
              >
              <el-menu-item index="6-2"
                ><router-link to="/employee"
                  >Mange Employee</router-link
                ></el-menu-item
              >
              <!-- <el-menu-item index="6-2.1">Mange Employee</el-menu-item> -->

              <el-menu-item index="6-3"
                ><router-link to="/performance"
                  >Employee Performance</router-link
                ></el-menu-item
              >
              <el-menu-item index="6-4">
                <router-link to="/salaryemployee"
                  >Manage Employee Salary</router-link
                >
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <!-- Leave -->
          <el-sub-menu index="7">
            <template #title>
              <el-icon>
                <clock />
              </el-icon>
              Leave
            </template>
            <el-menu-item-group>
              <template #title>Leave</template>
              <el-menu-item index="7-1">Weekly Holiday</el-menu-item>
              <el-menu-item index="7-2">Holiday</el-menu-item>
              <el-menu-item index="7-3">
                <router-link to="/leavetype">Leave Type</router-link>
              </el-menu-item>
              <el-menu-item index="7-4">
                <router-link to="/leaveapplication"
                  >Leave Application</router-link
                ></el-menu-item
              >
            </el-menu-item-group>
          </el-sub-menu>

          <!-- Loan -->
          <!-- <el-sub-menu index="8">
            <template #title>
              <el-icon>
                <money />
              </el-icon>
              Loan
            </template>
            <el-menu-item-group>
              <template #title>Loan</template>
              <el-menu-item index="8-1">Grant Loan</el-menu-item>
              <el-menu-item index="8-2">Loan Installment</el-menu-item>
              <el-menu-item index="8-3">Loan Report</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu> -->

          <!-- Salary -->
          <el-sub-menu index="9">
            <template #title>
              <el-icon>
                <coin />
              </el-icon>
              Salary
            </template>
            <el-menu-item-group>
              <template #title>Payroll</template>
              <el-menu-item index="9-1">
                <router-link to="/salarytype">Salary Type Setup</router-link>
              </el-menu-item>
              <el-menu-item index="9-2">
                <router-link to="/salarysetup">Salary SetUp</router-link>
              </el-menu-item>
              <el-menu-item index="9-3">
                <router-link to="/salarygenerate">Salary Generate</router-link>
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <!-- report -->
          <el-sub-menu index="8">
            <template #title>
              <el-icon>
                <money />
              </el-icon>
              Report
            </template>
            <el-menu-item-group>
              <template #title>Report</template>
              <el-menu-item index="8-1">*</el-menu-item>
              <el-menu-item index="8-2">**</el-menu-item>
              <el-menu-item index="8-3">***</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <!-- Main Content -->
    <el-container>
      <el-header
        class="animated-bg text-white rounded-3xl flex justify-between items-center"
      >
        <!-- Sidebar Toggle Button -->
        <el-button
          v-if="isMobile"
          @click="toggleSidebar"
          class="ml-2 mt-2 mr-2"
          icon="el-icon-menu"
          circle
        />
        <div class="toolbar flex items-center ml-auto">
          <el-dropdown>
            <el-icon class="mr-2 mt-2"><Setting /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  ><router-link to="/insertstudent">Kill Me</router-link>
                </el-dropdown-item>
                <el-dropdown-item @click="logout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <!-- <span v-if="userEmail" class="mr-4">Logged in as: {{ userEmail }}</span> -->
          <span><h1>{/"Soriya" : "Samphors"}</h1></span>
        </div>
      </el-header>

      <el-main class="m-6">
        <el-scrollbar>
          <router-view></router-view>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Meteor } from "meteor/meteor";
import {
  User,
  Calendar,
  Star,
  OfficeBuilding,
  Clock,
  Money,
  Coin,
  Setting,
  User as EmployeeIcon,
  UserFilled,
} from "@element-plus/icons-vue";
// import BackgroundAnimation from "../components/BackgroundAnimation.vue";

const userEmail = ref<string>("");
const router = useRouter();
const isSidebarOpen = ref(true);
const isMobile = ref(false);

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) isSidebarOpen.value = false;
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Function to update user email
const updateEmail = () => {
  const user = Meteor.user();
  if (user && user.emails) {
    const gmail = user.emails.find(
      (email) => email.address.endsWith("@gmail.com") && email.verified
    );
    if (gmail) {
      userEmail.value = gmail.address;
      localStorage.setItem("userEmail", gmail.address); // Store Gmail in localStorage
    }
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);

  // Check if email is stored in localStorage
  const storedEmail = localStorage.getItem("userEmail");
  if (storedEmail) {
    userEmail.value = storedEmail;
  } else {
    updateEmail(); // Fetch email from Meteor
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});

const logout = () => {
  Meteor.logout((err) => {
    if (!err) router.push("/login");
  });
};
</script>

<style scoped>
.layout-container-demo {
  height: 100vh;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-main {
  padding: 0;
  height: calc(100vh - 56px);
  overflow: auto;
}

.toolbar {
  display: flex;
  align-items: center;
}
@keyframes gradientBG {
  0% {
    background: #f3f4f6;
  } /* gray-100 */
  25% {
    background: #e5e7eb;
  } /* gray-200 */
  50% {
    background: #d1d5db;
  } /* gray-300 */
  75% {
    background: #9ca3af;
  } /* gray-400 */
  100% {
    background: #f3f4f6;
  } /* gray-100 */
}

.animated-bg {
  animation: gradientBG 6s infinite alternate ease-in-out;
}
</style>
