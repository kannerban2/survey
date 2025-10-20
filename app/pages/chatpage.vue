<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'

// Use default layout
// If you want a blank page without header/footer, set layout: false
// definePageMeta({ layout: false })

interface ChatMessage {
  id: number
  role: 'ai' | 'user' | 'system'
  type: 'text' | 'pdpa'
  content: string
  timestamp: number
}

const messages = ref<ChatMessage[]>([])
const input = ref('')
const sending = ref(false)
const pdpaAccepted = ref<boolean>(false)
const selectedLang = ref<'th' | 'en'>(getSavedLang())

const listRef = ref<HTMLDivElement | null>(null)

function getSavedLang(): 'th' | 'en' {
  const v = (process.client ? localStorage.getItem('chat_lang') : null) as 'th' | 'en' | null
  return v === 'en' ? 'en' : 'th'
}

function saveLang() {
  if (process.client) localStorage.setItem('chat_lang', selectedLang.value)
}

function saveConsent(v: boolean) {
  if (process.client) localStorage.setItem('pdpaAccepted', v ? '1' : '0')
}

function restoreConsent(): boolean {
  if (!process.client) return false
  return localStorage.getItem('pdpaAccepted') === '1'
}

function addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>) {
  messages.value.push({ id: Date.now() + Math.random(), timestamp: Date.now(), ...msg })
  nextTick(() => scrollToBottom())
}

function scrollToBottom() {
  const el = listRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function showPdpaCard() {
  const th = `PDPA Consent\n\nเพื่อให้เป็นไปตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) ระบบจะเก็บข้อมูลการสนทนาเพื่อปรับปรุงบริการ คุณสามารถยินยอมหรือไม่ยินยอมได้ หากไม่ยินยอม คุณจะไม่สามารถเริ่มการสนทนาได้`
  const en = `PDPA Consent\n\nTo comply with personal data protection, this chat may store your messages to improve the service. You can accept or decline. If you decline, you will not be able to start the conversation.`
  addMessage({ role: 'ai', type: 'pdpa', content: selectedLang.value === 'en' ? en : th })
}

function acceptPdpa() {
  if (pdpaAccepted.value) return
  pdpaAccepted.value = true
  saveConsent(true)
  addMessage({ role: 'system', type: 'text', content: selectedLang.value === 'en' ? 'You accepted PDPA. You can start chatting now.' : 'คุณได้ยินยอม PDPA แล้ว สามารถเริ่มสนทนาได้' })
}

function declinePdpa() {
  pdpaAccepted.value = false
  saveConsent(false)
  addMessage({ role: 'system', type: 'text', content: selectedLang.value === 'en' ? 'You declined PDPA. Chat is disabled.' : 'คุณไม่ยินยอม PDPA จึงไม่สามารถใช้งานแชตได้' })
}

async function sendMessage() {
  if (!pdpaAccepted.value) return
  const text = input.value.trim()
  if (!text) return
  sending.value = true
  addMessage({ role: 'user', type: 'text', content: text })
  input.value = ''

  // Mock AI reply after a short delay
  setTimeout(() => {
    const reply = selectedLang.value === 'en'
      ? "This is a sample AI reply for demo purposes."
      : "นี่คือข้อความตอบกลับตัวอย่างจาก AI เพื่อสาธิตการทำงาน"
    addMessage({ role: 'ai', type: 'text', content: reply })
    sending.value = false
  }, 600)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

onMounted(() => {
  pdpaAccepted.value = restoreConsent()
  if (!pdpaAccepted.value) {
    showPdpaCard()
  } else {
    addMessage({ role: 'ai', type: 'text', content: selectedLang.value === 'en' ? 'How can I help you today?' : 'มีอะไรให้ช่วยไหมวันนี้' })
  }
  nextTick(() => scrollToBottom())
})
</script>

<template>
  <div class="chat-page">
    <div class="chat-window">
      <!-- legend -->
      <div class="legend">
        <span class="chip ai">AI</span>
        <span class="chip user">User</span>
      </div>

      <!-- messages list -->
      <div class="messages" ref="listRef">
        <template v-for="m in messages" :key="m.id">
          <!-- PDPA card -->
          <div v-if="m.type === 'pdpa'" class="row ai">
            <div class="bubble pdpa">
              <h4>PDPA Consent</h4>
              <p class="pre">{{ m.content }}</p>
              <div class="pdpa-actions">
                <button class="btn primary" @click="acceptPdpa" :disabled="pdpaAccepted">ยินยอม</button>
                <button class="btn danger" @click="declinePdpa">ไม่ยินยอม</button>
              </div>
              <div class="lang">
                <label>ภาษา / Language:</label>
                <select v-model="selectedLang" @change="saveLang">
                  <option value="th">ไทย</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Normal text messages -->
          <div v-else :class="['row', m.role]">
            <div class="bubble" :class="m.role">{{ m.content }}</div>
          </div>
        </template>
      </div>

      <!-- composer -->
      <div class="composer">
        <textarea
          v-model="input"
          class="input"
          placeholder="พิมพ์ข้อความ... (Enter เพื่อส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
          @keydown="onKeydown"
          :disabled="!pdpaAccepted || sending"
          rows="1"
        />
        <button class="btn primary send" @click="sendMessage" :disabled="!pdpaAccepted || sending || !input.trim()">ส่ง</button>
      </div>
      <p v-if="!pdpaAccepted" class="consent-hint">โปรดยินยอม PDPA ก่อนเริ่มใช้งาน</p>
    </div>
  </div>
</template>

<style scoped>
.chat-page { display:flex; justify-content:center; padding: 12px; }
.chat-window { width: 100%; max-width: 860px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.06); display:flex; flex-direction: column; min-height: calc(100vh - 24px); }

.legend { display:flex; gap: 8px; padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
.chip { font-size: 12px; padding: 4px 10px; border-radius: 999px; border: 1px solid #e5e7eb; }
.chip.ai { background: #f3f4f6; }
.chip.user { background: #d1fae5; border-color: #10b981; }

.messages { flex: 1; overflow-y: auto; padding: 16px; }
.row { display:flex; margin-bottom: 10px; }
.row.ai { justify-content: flex-start; }
.row.user { justify-content: flex-end; }

.bubble { max-width: 78%; padding: 10px 12px; border-radius: 14px; border: 1px solid #e5e7eb; white-space: pre-wrap; }
.bubble.ai { background: #f8fafc; }
.bubble.user { background: #dcfce7; border-color: #bbf7d0; }

.bubble.pdpa { background: #f8fafc; width: 100%; max-width: 640px; }
.bubble.pdpa h4 { margin: 2px 0 8px; font-size: 14px; }
.pre { white-space: pre-wrap; }
.pdpa-actions { display:flex; gap: 8px; margin-top: 10px; }

.lang { margin-top: 10px; display:flex; align-items:center; gap: 8px; }
.lang select { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; }

.composer { display:flex; gap: 8px; padding: 10px; border-top: 1px solid #f0f0f0; }
.input { flex:1; resize: none; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px; }
.send { padding: 10px 14px; }

.btn { padding: 6px 10px; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; cursor: pointer; }
.btn.primary { background: #2563eb; color: #fff; border-color: #1d4ed8; }
.btn.danger { background: #fca5a5; color: #111827; border-color: #ef4444; }

.consent-hint { color: #111; font-size: 12px; padding: 0 12px 10px; }

@media (max-width: 480px) {
  .bubble { max-width: 88%; }
}
</style>

