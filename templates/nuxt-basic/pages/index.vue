<template>
  <div class="flex min-h-screen flex-col items-center justify-center p-24">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-8">
        🚀 __PROJECT_NAME__
      </h1>
      <p class="text-xl mb-8">
        Welcome to your Nuxt.js application!
      </p>
      <div class="bg-gray-100 p-6 rounded-lg mb-8">
        <p><strong>Framework:</strong> Nuxt.js</p>
        <p><strong>Port:</strong> __PORT__</p>
        <p><strong>Created with:</strong> Nova</p>
      </div>
      <p class="text-gray-600">
        Edit <code class="bg-gray-200 px-2 py-1 rounded">pages/index.vue</code> to get started.
      </p>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '__PROJECT_NAME__'
})
</script>