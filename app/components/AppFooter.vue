<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="inner">
      <div class="left">
        <span>© {{ year }} Survey</span>
        <span class="sep">•</span>
        <span>All rights reserved</span>
      </div>
      <div class="right">
        <NuxtLink to="/" class="link">Home</NuxtLink>
        <a href="#" class="link">Privacy</a>
        <a href="#" class="link">Terms</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 16px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
}
.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111827;
  font-size: 13px;
}
.left { display:flex; align-items:center; gap: 6px; flex-wrap: wrap; }
.right { display:flex; align-items:center; gap: 10px; }
.link { color: #374151; text-decoration: none; }
.link:hover { text-decoration: underline; }
.sep { color: #9ca3af; }

@media (max-width: 720px) {
  .inner { flex-direction: column; gap: 8px; }
}
</style>

