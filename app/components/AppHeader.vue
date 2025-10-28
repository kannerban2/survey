<script setup lang="ts">
import { ref } from 'vue'

const route = useRoute()
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function isActive(path: string) {
  // simple active check: exact or startsWith for sections
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function logout() {
  const token = useCookie('auth_token')
  token.value = null
  navigateTo('/login')
}
</script>

<template>
  <header class="topbar">
    <div class="inner">
      <div class="left">
        <NuxtLink to="/" class="brand">Survey</NuxtLink>
        <nav class="nav" :class="{ open: menuOpen }">
          <NuxtLink to="/" class="link" :class="{ active: isActive('/') }">Campaigns</NuxtLink>
          <NuxtLink to="/campaingreport" class="link" :class="{ active: isActive('/campaingreport') }">Answers</NuxtLink>
<!--          <NuxtLink to="/chatpage" class="link" :class="{ active: isActive('/chatpage') }">Chat</NuxtLink>-->
<!--          <NuxtLink to="/app/pages/reportsum" class="link" :class="{ active: isActive('/report') }">Report</NuxtLink>-->
        </nav>
      </div>
      <div class="right">
        <button class="btn" @click="logout">Logout</button>
        <button class="menu" @click="toggleMenu" aria-label="Toggle menu">☰</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  max-width: 1200px;
  margin: 0 auto;
}
.left { display:flex; align-items:center; gap: 12px; }
.brand {
  font-weight: 700;
  color: #111827;
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 8px;
}
.nav {
  display: flex;
  align-items: center;
  gap: 6px;
}
.link {
  color: #111827;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
}
.link:hover { background: #f3f4f6; }
.link.active { border-color: #1d4ed8; color: #1d4ed8; }

.right { display:flex; align-items:center; gap: 8px; }
.btn {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  color: #111827;
}
.btn:hover { background: #f9fafb; }
.menu {
  display: none;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 720px) {
  .nav { display: none; position: absolute; top: 48px; left: 0; right: 0; background: #fff; border-bottom: 1px solid #e5e7eb; padding: 8px 12px; }
  .nav.open { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
  .menu { display: inline-block; }
}
</style>

