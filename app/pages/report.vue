<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ThemeCount { theme: string; count: number }

const data = ref<ThemeCount[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const campaingIdFilter = ref<string>('')

const Categories = computed(() => ({
  count: {
    name: 'จำนวน',
    color: '#22c55e',
  },
}))

const xFormatter = (i: number): string => `${data.value[i]?.theme ?? ''}`
const yFormatter = (tick: number) => `${tick}`

async function fetchChart() {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    const cid = Number(campaingIdFilter.value)
    if (!Number.isNaN(cid) && campaingIdFilter.value.trim() !== '') {
      params.set('campaing_id', String(cid))
    }
    const res = await $fetch<{ data: ThemeCount[] }>(`/api/campaing_answers/themes${params.toString() ? '?' + params.toString() : ''}`)
    data.value = res.data ?? []
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to load chart'
  } finally {
    loading.value = false
  }
}

function applyFilter() {
  fetchChart()
}

function clearFilter() {
  campaingIdFilter.value = ''
  fetchChart()
}

onMounted(fetchChart)
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h1>สรุปผลตาม Theme</h1>
      <div class="filters">
        <label for="cid">Campaign ID:</label>
        <input id="cid" v-model.trim="campaingIdFilter" type="number" placeholder="e.g. 1" />
        <button class="btn" @click="clearFilter">Clear</button>
        <button class="btn primary" @click="applyFilter">Filter</button>
      </div>
    </div>

    <div v-if="loading" class="info">Loading chart...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <BarChart
      v-else
      :data="data"
      :height="340"
      :categories="Categories"
      :y-axis="['count']"
      :radius="4"
      :y-grid-line="true"
      :x-formatter="xFormatter"
      :y-formatter="yFormatter"
      :legend-position="LegendPosition.Top"
      :hide-legend="false"
    />
  </div>
</template>

<style scoped>
.page { padding: 16px; max-width: 1100px; margin: 0 auto; }
.toolbar { display:flex; justify-content: space-between; align-items:center; margin-bottom: 12px; gap: 12px; flex-wrap: wrap; }
.filters { display:flex; align-items:center; gap: 8px; }
.btn { padding: 8px 12px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; border-radius: 8px; margin-right: 6px; }
.btn.primary { background: #2563eb; color: #fff; border-color: #1d4ed8; }
.info { color: #2563eb; }
.error { color: #b91c1c; }
.toolbar input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; width: 140px; }
</style>