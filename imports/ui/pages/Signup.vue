<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
      <img
        src="/animals.gif"
        alt="App Logo"
        class="w-24 h-24 mx-auto rounded-full shadow-md mb-6"
      />
      <h2 class="text-2xl font-semibold text-center text-gray-800">
        Create an Account
      </h2>
      <form @submit.prevent="signup" class="mt-6">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            class="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div class="mb-4 relative">
          <label for="password" class="block text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter your password"
            required
            class="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div class="mb-6 relative">
          <label for="confirm-password" class="block text-sm font-medium text-gray-600">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Confirm your password"
            required
            class="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 mt-7"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading" class="loader"></span>
          {{ isLoading ? 'Signing up...' : 'Signup' }}
        </button>
      </form>
      <p class="mt-4 text-sm text-center text-gray-600">
        Already have an account?
        <router-link to="/login" class="text-blue-500 hover:underline">
          Log in
        </router-link>
      </p>
      <div v-if="errorMessage" class="mt-4 text-sm text-center text-red-500">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Accounts } from "meteor/accounts-base";

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const router = useRouter();

const signup = () => {
  if (!email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = "Please fill in all fields.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  Accounts.createUser(
    {
      email: email.value,
      password: password.value,
    },
    (error) => {
      isLoading.value = false;
      if (error) {
        errorMessage.value = error.reason || "Signup failed. Please try again.";
      } else {
        router.push("/home");
      }
    }
  );
};
</script>
