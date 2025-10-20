<template>
  <div class="page">
    <div class="toolbar">
      <h1>Campaigns</h1>
      <button class="btn primary" @click="openCreate()">+ Create Campaign</button>
    </div>

    <div v-if="loading" class="info">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Description</th>
          <th>Scope</th>
          <th>Status</th>
          <th>Link</th>
          <th>Created</th>
          <th>Updated</th>
          <th style="width:130px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="campaigns.length === 0">
          <td colspan="9" class="muted">No campaigns</td>
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
          <td>{{ formatDate(c.update_at) }}</td>
          <td>
            <button class="btn" @click="openEdit(c)">Edit</button>
            <button class="btn danger" @click="confirmDelete(c)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal()">
      <div class="modal">
        <h3>{{ editingId ? 'Edit Campaign' : 'Create Campaign' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <label>Name<span class="req">*</span></label>
            <input v-model.trim="form.name" type="text" required placeholder="Campaign name" />
          </div>
          <div class="form-row">
            <label>Description</label>
            <input v-model.trim="form.description" type="text" placeholder="Short description" />
          </div>
          <div class="form-row">
            <label>Scope</label>
            <input v-model.trim="form.scope" type="text" placeholder="Scope" />
          </div>
          <div class="form-row">
            <label>Status</label>
            <input v-model.trim="form.status" type="text" placeholder="Status" />
          </div>
          <div class="form-row">
            <label>Link</label>
            <input v-model.trim="form.link" type="url" placeholder="https://..." />
          </div>

          <div class="actions">
            <button type="button" class="btn" @click="closeModal()">Cancel</button>
            <button type="submit" class="btn primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : (editingId ? 'Save' : 'Create') }}
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
      formError.value = 'Name is required'
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
    formError.value = err?.data?.message || err?.message || 'Save failed'
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
.page { padding: 16px; }
.toolbar { display:flex; justify-content: space-between; align-items:center; margin-bottom: 12px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #e2e2e2; padding: 8px; text-align: left; }
.table th { background: #fafafa; }
.muted { color: #000; text-align:center; }
.btn { padding: 6px 10px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px; margin-right: 6px; }
.btn.primary { background: #2563eb; color: #fff; border-color: #1d4ed8; }
.btn.danger { background: #ef4444; color: #fff; border-color: #dc2626; }
.info { color: #2563eb; }
.error { color: #b91c1c; }
.req { color: #ef4444; margin-left: 3px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; padding: 12px; }
.modal { background:#fff; padding: 16px; border-radius: 8px; width: 100%; max-width: 520px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.form-row { display:flex; flex-direction: column; margin-bottom: 10px; }
.form-row label { font-weight: 600; margin-bottom: 4px; }
.form-row input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
.actions { display:flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
</style>

