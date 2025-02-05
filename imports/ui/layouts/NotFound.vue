<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-red-500">404</h1>
      <p class="mt-4 text-xl text-gray-700">
        Oops! The page you are looking for doesn't exist.
      </p>
      <p class="mt-2 text-lg text-gray-500">
        It might have been moved or deleted, or the URL might be incorrect.
      </p>
      <el-button class="mt-6" type="primary" @click="goHome"
        >Go Back to Home</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ElButton } from "element-plus";

const router = useRouter();

const goHome = () => {
  router.push("/");
};
</script>

<style scoped>
</style>
