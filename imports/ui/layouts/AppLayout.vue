<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Header with a light gradient and subtle shadow -->
    <header
      v-if="isLoggedIn"
      class="bg-gradient-to-r from-gray-300 to-gray-400 w-100 mx-4 mt-4 mr-4 rounded-br-3xl rounded-tl-3xl rounded-tr-lg rounded-bl-lg shadow-md"
    >
      <div class="container mx-auto flex items-center justify-between p-8">
        <!-- Header Title -->
        <h1 class="header-title">Class Management System ❤️‍🔥</h1>
        <nav class="flex space-x-2">
          <!-- Sidebar Toggle Button -->
          <button @click="toggleSidebar" class="sidebar-toggle-button">
            <span class="button_top">{{ sidebarVisible ? "😍" : "😖" }}</span>
          </button>
          <!-- (Logout button removed from header) -->
        </nav>
      </div>
    </header>

    <div class="flex flex-grow mb-8">
       <aside
        v-show="sidebarVisible"
        class="relative w-62 bg-gray-300 h-full flex flex-col rounded-br-3xl rounded-tl-3xl rounded-tr-lg rounded-bl-lg m-4 p-6 text-center font-semibold transition-transform shadow-md"
      >
        <ul class="space-y-4 text-xl">
          <li>
            <router-link
              to="/insertstudent"
              :class="[ isActive('/insertstudent') ? 'bg-gray-200 text-white ' : '', 'hover:text-white font-sans text-xl block px-4 py-2 rounded-3xl' ]"
            >
              Student
            </router-link>
          </li>
          <li>
            <router-link
              to="/insertteacher"
              :class="[ isActive('/insertteacher') ? 'bg-gray-200 text-white' : '', 'hover:text-white font-sans text-xl block px-4 py-2 rounded-3xl' ]"
            >
              Teacher
            </router-link>
          </li>
          <li>
            <router-link
              to="/insertcourse"
              :class="[ isActive('/insertcourse') ? 'bg-gray-200 text-white' : '', 'hover:text-white font-sans text-xl block px-4 py-2 rounded-3xl' ]"
            >
              Course
            </router-link>
          </li>
          <li>
            <router-link
              to="/insertenrollment"
              :class="[ isActive('/insertenrollment') ? 'bg-gray-200 text-white' : '', 'hover:text-white font-sans text-xl block px-4 py-2 rounded-3xl' ]"
            >
              Enrollment
            </router-link>
          </li>
        </ul>
        <!-- Logout Button container (DO NOT TOUCH the </ul> above) -->
        <div class="absolute bottom-0 left-0 w-full flex justify-center pb-4">
          <button v-if="isLoggedIn" @click="logout" class="logout-button">
            <span class="button_top">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-grow container mx-auto p-6">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Meteor } from "meteor/meteor";

const router = useRouter();
const route = useRoute();
const sidebarVisible = ref(true);

const isLoggedIn = computed(() => !!Meteor.userId());

const isActive = (routePath) => {
  return route.path.startsWith(routePath);
};

const logout = () => {
  Meteor.logout(() => {
    router.push("/login"); // Redirect to login after logout
  });
};

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};
</script>

<style scoped>
/* Button Styles */
button {
  --button_radius: 0.75em;
  --button_color: #e8e8e8;
  --button_outline_color: #000000;
  font-size: 17px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: var(--button_radius);
  background: var(--button_outline_color);
}

.button_top {
  display: block;
  box-sizing: border-box;
  border: 2px solid var(--button_outline_color);
  border-radius: var(--button_radius);
  padding: 0.5em 1em;
  background: var(--button_color);
  color: var(--button_outline_color);
  transform: translateY(-0.2em);
  transition: transform 0.1s ease;
}

button:hover .button_top {
  transform: translateY(-0.33em);
}

button:active .button_top {
  transform: translateY(0);
}

/* Header Title Styling */
.header-title {
  display: inline-block;
  padding: 0.5em 1em;
  border: 2px solid var(--button_outline_color);
  border-radius: var(--button_radius);
  background: var(--button_color);
  color: var(--button_outline_color);
  font-size: 2rem;
  font-weight: bold;
  transition: transform 0.1s ease;
}

.header-title:hover {
  transform: translateY(-0.2em);
}

/* Active Route Styling */
.active-route {
  display: block;
  background: linear-gradient(to right, white);
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
}

/* Responsive Sidebar */
@media (max-width: 1024px) {
  aside {
    width: 100%;
  }
}
</style>
