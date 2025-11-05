<template>
  <div class="page">
    <div class="toolbar">
      <h1>แคมเปญทั้งหมด</h1>
      <button class="btn primary" @click="openCreate()">+ สร้างแคมเปญ</button>
    </div>

    <div v-if="loading" class="info">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>ลำดับ</th>
          <th>ชื่อแคมเปญ</th>
          <th>รายละเอียดแคมเปญ</th>
          <th>ขอบเขต</th>
          <th>สถานะ</th>
          <th>Link</th>
          <th>Created</th>
          <th style="width:130px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="campaigns.length === 0">
          <td colspan="8" class="muted">No campaigns</td>
        </tr>
        <tr v-for="c in campaigns" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.name }}</td>
          <td>{{ c.description }}</td>
          <td>{{ c.scope }}</td>
          <td>{{ c.status }}</td>
          <td>
            <a v-if="c.link" :href="c.link" target="_blank" rel="noopener">Open</a>
          </td>
          <td>{{ formatDate(c.created_at) }}</td>
          <td class="actions-cell">
            <button class="icon-btn gray" type="button" @click="openEdit(c)" title="แก้ไข" aria-label="แก้ไข">
              <i class="bx bx-pencil"></i>
            </button>
            <button class="icon-btn red" type="button" @click="confirmDelete(c)" title="ลบ" aria-label="ลบ">
              <i class="bx bx-trash"></i>
            </button>
            <NuxtLink
              class="icon-btn primary"
              :to="{ path: '/chatpage', query: { campaign: c.name ?? '', scope: c.scope ?? '', campaignId: c.id } }"
              title="ไปหน้าแชท"
              aria-label="ไปหน้าแชท"
            >
              <i class="bx bx-chat"></i>
            </NuxtLink>
            <NuxtLink
                class="icon-btn primary"
                :to="{ path: `/report/${c.id}`, query: { campaign: c.name ?? '' } }"
                title="ไปหน้ารายงาน"
                aria-label="ไปหน้ารายงาน"
            >
              <i class='bx bx-chart'></i>
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal()">
      <div class="modal">
        <h3>{{ editingId ? 'แก้ไขแคมเปญ' : 'สร้างแคมเปญ' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <label>ชื่อแคมเปญ<span class="req">*</span></label>
            <input v-model.trim="form.name" type="text" required placeholder="ชื่อแคมเปญ" />
          </div>
          <div class="form-row">
            <label>รายละเอียด</label>
            <input v-model.trim="form.description" type="text" placeholder="รายละเอียดโดยย่อ" />
          </div>
          <div class="form-row">
            <label>ขอบเขต</label>
            <input v-model.trim="form.scope" type="text" placeholder="ขอบเขต" />
          </div>
          <div class="form-row">
            <label>สถานะ</label>
            <input v-model.trim="form.status" type="text" placeholder="สถานะ" />
          </div>
          <div class="form-row">
            <label>ลิงก์</label>
            <input v-model.trim="form.link" type="url" placeholder="https://..." />
          </div>

          <div class="actions">
            <button type="button" class="btn" @click="closeModal()">ยกเลิก</button>
            <button type="submit" class="btn primary" :disabled="submitting">
              {{ submitting ? 'กำลังบันทึก...' : (editingId ? 'บันทึก' : 'สร้าง') }}
            </button>
          </div>
          <p v-if="formError" class="error" style="margin-top:8px;">{{ formError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Campaign {
  id: number
  name: string | null
  description: string | null
  scope: string | null
  status: string | null
  link: string | null
  created_at: string | null
  update_at: string | null
}

const campaigns = ref<Campaign[]>([])
const loading = ref(true)
const error = ref<string| null>(null)

const showModal = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  description: '',
  scope: '',
  status: '',
  link: ''
})
const formError = ref('')

function resetForm() {
  form.name = ''
  form.description = ''
  form.scope = ''
  form.status = ''
  form.link = ''
  formError.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  showModal.value = true
}

function openEdit(c: Campaign) {
  editingId.value = c.id
  form.name = c.name ?? ''
  form.description = c.description ?? ''
  form.scope = c.scope ?? ''
  form.status = c.status ?? ''
  form.link = c.link ?? ''
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function fetchCampaigns() {
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<{ data: Campaign[] }>('/api/campaigns')
    campaigns.value = res.data ?? []
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, message?: string }
    error.value = err?.data?.message || err?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  submitting.value = true
  formError.value = ''
  try {
    if (!form.name?.trim()) {
      formError.value = 'กรุณากรอกชื่อแคมเปญ'
      return
    }
    if (editingId.value) {
      await $fetch(`/api/campaigns/${editingId.value}`, { method: 'PUT', body: form })
    } else {
      await $fetch('/api/campaigns', { method: 'POST', body: form })
    }
    await fetchCampaigns()
    showModal.value = false
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, message?: string }
    formError.value = err?.data?.message || err?.message || 'บันทึกล้มเหลว'
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(c: Campaign) {
  if (!confirm(`Delete campaign #${c.id}?`)) return
  try {
    await $fetch(`/api/campaigns/${c.id}`, { method: 'DELETE' })
    await fetchCampaigns()
  } catch {
    alert('Delete failed')
  }
}

function pad(n: number) { return n < 10 ? '0' + n : '' + n }
function formatDate(value: string | number | Date | null | undefined) {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return String(value)
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch { return String(value) }
}

onMounted(fetchCampaigns)
</script>

<style scoped>
.page { padding: 16px; max-width: 1200px; margin: 0 auto; }
.toolbar { display:flex; justify-content: space-between; align-items:center; margin-bottom: 12px; gap: 12px; flex-wrap: wrap; }

/* Modern table card */
.table { width: 100%; border-collapse: separate; border-spacing: 0; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(16,24,40,0.05); }
.table th, .table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #f1f5f9; }
.table th { background: #f8fafc; color: #0f172a; font-weight: 600; }
.table tr:last-child td { border-bottom: none; }
.table tbody tr:nth-child(even) { background: #fcfcfd; }
.table tbody tr:hover { background: #f8fafc; }

.muted { color: #6b7280; text-align:center; }
.btn { padding: 8px 12px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; border-radius: 8px; margin-right: 6px; }
.btn.primary { background: #2563eb; color: #fff; border-color: #1d4ed8; }
.btn.danger { background: #ef4444; color: #fff; border-color: #dc2626; }
.info { color: #2563eb; }
.error { color: #b91c1c; }
.req { color: #ef4444; margin-left: 3px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; padding: 12px; }
.modal { background:#fff; padding: 16px; border-radius: 12px; width: 100%; max-width: 520px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.form-row { display:flex; flex-direction: column; margin-bottom: 10px; }
.form-row label { font-weight: 600; margin-bottom: 4px; }
.form-row input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; }
.actions { display:flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
/* Compact inline actions in table cells to prevent overlap */
.actions-cell { display: inline-flex; align-items: center; gap: 6px; }

/* Small square icon buttons (Boxicons) */
.icon-btn { width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; color: #374151; cursor: pointer; text-decoration: none; }
.icon-btn:hover { background: #f3f4f6; }
.icon-btn i { font-size: 16px; line-height: 1; }
.icon-btn.primary { border-color: #2563eb; color: #2563eb; background: #eef2ff; }
.icon-btn.red { border-color: #ef4444; color: #ef4444; background: #fff5f5; }
.icon-btn.gray { color: #374151; }
</style>

