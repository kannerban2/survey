<template>
  <div class="layout">
    <AppHeader />
    <main class="page-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&display=swap');

html, body, #__nuxt, #__layout { height: 100%; }
html, body { background: #ffffff !important; color: #0f172a; }
:root { color-scheme: light; }
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  font-family: 'Noto Sans Thai', sans-serif;
}
.page-content {
  flex: 1;
  display: block;
}
</style>
