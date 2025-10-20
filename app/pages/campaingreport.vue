<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface CampaingAnswer {
  id: number
  campaing_id: number | null
  theme: string | null
  sex: string | null
  age: number | null
  job: string | null
  time_user: number | null
  created_at: string | null
  updated_at: string | null
}

const answers = ref<CampaingAnswer[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const limit = ref(100)
const offset = ref(0)
const campaingIdFilter = ref<string>('')

function pad(n: number) { return n < 10 ? '0' + n : '' + n }
function formatDate(value: string | number | Date | null | undefined) {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return String(value)
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch { return String(value) }
}

async function fetchAnswers() {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    params.set('limit', String(limit.value))
    params.set('offset', String(offset.value))
    const cid = Number(campaingIdFilter.value)
    if (!Number.isNaN(cid) && campaingIdFilter.value.trim() !== '') {
      params.set('campaing_id', String(cid))
    }
    const res = await $fetch<{ data: CampaingAnswer[] }>(`/api/campaing_answers?${params.toString()}`)
    answers.value = res.data ?? []
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, message?: string }
    error.value = err?.data?.message || err?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

function applyFilter() {
  offset.value = 0
  fetchAnswers()
}

function clearFilter() {
  campaingIdFilter.value = ''
  offset.value = 0
  fetchAnswers()
}

function nextPage() {
  offset.value += limit.value
  fetchAnswers()
}

function prevPage() {
  offset.value = Math.max(0, offset.value - limit.value)
  fetchAnswers()
}

onMounted(fetchAnswers)
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h1>Campaign Answers</h1>
      <div class="filters">
        <label for="cid">Campaign ID:</label>
        <input id="cid" v-model.trim="campaingIdFilter" type="number" placeholder="e.g. 1" />
        <button class="btn" @click="clearFilter">Clear</button>
        <button class="btn primary" @click="applyFilter">Filter</button>
      </div>
    </div>

    <div class="toolbar" style="margin-top:-8px; gap: 8px;">
      <div class="pager">
        <button class="btn" :disabled="offset === 0 || loading" @click="prevPage">Prev</button>
        <button class="btn" :disabled="loading || answers.length < limit" @click="nextPage">Next</button>
        <span class="muted">Showing {{ answers.length }} rows (offset {{ offset }})</span>
      </div>
      <div />
    </div>

    <div v-if="loading" class="info">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Campaign ID</th>
          <th>Theme</th>
          <th>Sex</th>
          <th>Age</th>
          <th>Job</th>
          <th>Time (sec)</th>
          <th>Created</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="answers.length === 0">
          <td colspan="9" class="muted">No data</td>
        </tr>
        <tr v-for="a in answers" :key="a.id">
          <td>{{ a.id }}</td>
          <td>{{ a.campaing_id }}</td>
          <td>{{ a.theme }}</td>
          <td>{{ a.sex }}</td>
          <td>{{ a.age }}</td>
          <td>{{ a.job }}</td>
          <td>{{ a.time_user }}</td>
          <td>{{ formatDate(a.created_at) }}</td>
          <td>{{ formatDate(a.updated_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.page { padding: 16px; }
.toolbar { display:flex; justify-content: space-between; align-items:center; margin-bottom: 12px; gap: 12px; flex-wrap: wrap; }
.filters { display:flex; align-items:center; gap: 8px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #e2e2e2; padding: 8px; text-align: left; }
.table th { background: #fafafa; }
.muted { color: #000; text-align:center; }
.btn { padding: 6px 10px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px; margin-right: 6px; }
.btn.primary { background: #2563eb; color: #fff; border-color: #1d4ed8; }
.info { color: #2563eb; }
.error { color: #b91c1c; }
.toolbar input { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; width: 120px; }
.pager { display:flex; align-items:center; gap: 8px; }
</style>
