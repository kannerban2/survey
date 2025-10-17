<template>
  <div class="min-h-screen grid place-items-center bg-gray-50">
    <div class="bg-white p-8 rounded-2xl shadow w-full max-w-md">
      <h1 class="text-2xl font-semibold text-center mb-6">เข้าสู่ระบบ</h1>

      <form @submit.prevent="onSubmit">
        <div class="mb-4">
          <label class="block text-sm mb-1">ชื่อผู้ใช้</label>
          <input v-model="username" type="text" class="w-full border p-2 rounded" required />
        </div>

        <div class="mb-6">
          <label class="block text-sm mb-1">รหัสผ่าน</label>
          <input v-model="password" type="password" class="w-full border p-2 rounded" required />
        </div>

        <button class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          เข้าสู่ระบบ
        </button>
      </form>

      <p v-if="err" class="text-red-500 text-center mt-4 text-sm">{{ err }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const username = ref('')
const password = ref('')
const err = ref('')

const onSubmit = async () => {
  err.value = ''
  const { data, error } = await useFetch('/api/auth/login', {
    method: 'POST',
    body: { username: username.value, password: password.value },
  })

  if (error.value) {
    err.value = (error.value.data as any)?.statusMessage || 'เข้าสู่ระบบไม่สำเร็จ'
    return
  }
  // token ถูกตั้งเป็น cookie ฝั่ง server แล้ว → ไปหน้าแรกได้เลย
  navigateTo('/')
}
</script>
