<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Route params and query
const route = useRoute()
const reportId = computed(() => String(route.params.id ?? ''))
const campaignName = computed(() => {
  const q = route.query?.campaign
  return q ? String(q) : ''
})

// -------- Mock Data (replace with real API later) --------
const executive = {
  objective: 'เข้าใจแรงจูงใจ การรับรู้แบรนด์ และ Pain Point ของผู้ใช้ เพื่อหาโอกาสทางนวัตกรรมและประสิทธิภาพการสื่อสาร',
  participants: 48,
  completes: 42,
  avgDurationMin: 18,
  keyInsights: [
    'Top-of-mind มาจากช่องทาง Social แต่ Conversion มักเกิดผ่านเพื่อน/รีวิว',
    'ช่วง Onboarding มีจุดสะดุดเรื่องการยืนยันตัวตนบนมือถือรุ่นเก่า',
    'ผู้ใช้ Gen Z คาดหวัง Self-service ชัดเจนกว่ากลุ่มอื่น',
  ],
  recommendations: [
    'ปรับ UX verification flow ให้เร็วขึ้น 30-40%',
    'ทำแคมเปญ UGC กระตุ้นรีวิวในกลุ่มกำลังซื้อหลัก',
    'ออกแบบ micro-copy ช่วยผู้ใช้ใหม่ให้สำเร็จเร็วขึ้น'
  ]
}

const participationTrend = [
  { day: 'D1', value: 6 },
  { day: 'D2', value: 9 },
  { day: 'D3', value: 12 },
  { day: 'D4', value: 7 },
  { day: 'D5', value: 8 },
  { day: 'D6', value: 5 },
  { day: 'D7', value: 10 },
]

// Methodology
const demographicsGender = [
  { group: 'หญิง', value: 52 },
  { group: 'ชาย', value: 45 },
  { group: 'อื่น ๆ', value: 3 },
]
const demographicsAge = [
  { group: '18-24', value: 22 },
  { group: '25-34', value: 38 },
  { group: '35-44', value: 24 },
  { group: '45+', value: 16 },
]
const occupations = [
  { group: 'นักศึกษา', value: 18 },
  { group: 'พนักงานเอกชน', value: 36 },
  { group: 'เจ้าของกิจการ/ฟรีแลนซ์', value: 20 },
  { group: 'อื่น ๆ', value: 8 },
]
const interviewMeta = {
  type: 'Qualitative (In-depth + Mini FGD)',
  tool: 'AI Interviewer',
  interviews: 42,
  steps: ['สรรหาผู้ให้สัมภาษณ์', 'กำหนดคู่มือคำถาม', 'สัมภาษณ์/บันทึก', 'ถอดรหัส (coding)', 'สรุป theme'],
  duration: '~18 นาที/คน',
  analysis: ['Coding', 'Thematic Analysis', 'Triangulation']
}

// Key themes
const themePrevalence = [
  { theme: 'Brand Perception', value: 72 },
  { theme: 'Onboarding UX', value: 64 },
  { theme: 'Pricing Value', value: 58 },
  { theme: 'Support & Trust', value: 49 },
]

const themes = [
  {
    name: 'Brand Perception',
    insight: 'แรงขับเคลื่อนมาจากรีวิวเพื่อนและคอนเทนต์สั้นมากกว่าสื่อทางการ',
    sub: [
      { name: 'Social Proof', count: 18, quotes: ['เห็นเพื่อนใช้เลยลองตาม', 'รีวิว Tiktok ทำให้ตัดสินใจเร็ว'] },
      { name: 'Brand Voice', count: 12, quotes: ['ข้อความประชาสัมพันธ์ยังดูเป็นทางการเกินไป'] },
    ]
  },
  {
    name: 'Onboarding UX',
    insight: 'ขั้นยืนยันตัวตนบนมือถือเก่าทำให้ Drop-off',
    sub: [
      { name: 'Verification', count: 20, quotes: ['กล้องถ่ายบัตรไม่ค่อยชัด', 'แอปค้างตอนกดยืนยัน'] },
      { name: 'Guidance', count: 10, quotes: ['อยากได้คำอธิบายสั้น ๆ ในแต่ละขั้นตอน'] },
    ]
  },
]

// Journey pattern (satisfaction over stages)
const journey = [
  { stage: 'Discover', score: 3.6 },
  { stage: 'Consider', score: 3.9 },
  { stage: 'Onboard', score: 2.8 },
  { stage: 'First Use', score: 3.4 },
  { stage: 'Repeat', score: 4.1 },
]

// Recommendations matrix (Impact vs Effort)
const recos = [
  { name: 'Streamline Verification', impact: 9, effort: 4, r: 14 },
  { name: 'UGC Campaign', impact: 7, effort: 3, r: 10 },
  { name: 'Micro-copy Revamp', impact: 6, effort: 2, r: 8 },
  { name: 'In-app Tutorial', impact: 5, effort: 5, r: 9 },
]

// Appendix quotes table (sample)
const quotes = [
  { theme: 'Social Proof', quote: 'เห็นเพื่อนแนะนำ เลยมั่นใจมากขึ้น', gender: 'หญิง', age: '25-34' },
  { theme: 'Verification', quote: 'มือถือเก่าถ่ายรูปบัตรยาก', gender: 'ชาย', age: '35-44' },
  { theme: 'Guidance', quote: 'อยากได้ตัวอย่างภาพให้ดู', gender: 'หญิง', age: '18-24' },
  { theme: 'Pricing', quote: 'ราคาโอเคถ้าได้ส่วนลดแรกเข้า', gender: 'ชาย', age: '25-34' },
]

const questions = [
  'เล่าเส้นทางตั้งแต่เห็นแบรนด์ครั้งแรกจนตัดสินใจใช้',
  'อะไรทำให้เชื่อมั่น/ลังเล',
  'อธิบายประสบการณ์ช่วงสมัครใช้งาน',
  'อะไรคือจุดที่ยาก/ติดขัด และอยากให้ปรับปรุง',
]

const credibility = [
  'คัดเลือกตัวอย่างหลายกลุ่มอายุ/อาชีพ',
  'บันทึก/ถอดรหัสอย่างเป็นระบบ',
  'ใช้ Triangulation จากหลายแหล่งข้อมูล',
  'ตรวจทานโดยทีมวิจัยอีกชุด (peer review)'
]

// ---------------- Chart.js bindings (client-only) ----------------
const lineRef = ref<HTMLCanvasElement | null>(null)
const genderRef = ref<HTMLCanvasElement | null>(null)
const ageRef = ref<HTMLCanvasElement | null>(null)
const occRef = ref<HTMLCanvasElement | null>(null)
const themeRef = ref<HTMLCanvasElement | null>(null)
const journeyRef = ref<HTMLCanvasElement | null>(null)
const bubbleRef = ref<HTMLCanvasElement | null>(null)

type ChartInstance = { destroy?: () => void }
 type ChartCtor = new (ctx: CanvasRenderingContext2D, config: object) => ChartInstance
 type ChartConfig = Record<string, unknown>

let charts: Record<string, ChartInstance | null> = {}

function makeChart(canvas: HTMLCanvasElement | null, config: ChartConfig) {
  if (!import.meta.client || !canvas) return null
  const Chart = (window as unknown as { Chart?: ChartCtor }).Chart
  if (!Chart) return null
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  return new Chart(ctx, config)
}

function ensureChart(key: string, canvas: HTMLCanvasElement | null, config: ChartConfig) {
  if (charts[key] && typeof charts[key]?.destroy === 'function') {
    charts[key]!.destroy?.()
  }
  const inst = makeChart(canvas, config)
  charts[key] = inst
  return inst
}

onMounted(async () => {
  if (!import.meta.client) return
  await nextTick()
  // 1) Participation trend (line, filled)
  charts.line = ensureChart('line', lineRef.value, {
    type: 'line',
    data: {
      labels: participationTrend.map(d => d.day),
      datasets: [{
        label: 'จำนวน',
        data: participationTrend.map(d => d.value),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.2)',
        pointRadius: 3,
        tension: 0.3,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  })

  // 2) Gender (doughnut)
  charts.gender = ensureChart('gender', genderRef.value, {
    type: 'doughnut',
    data: {
      labels: demographicsGender.map(d => d.group),
      datasets: [{
        data: demographicsGender.map(d => d.value),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  })

  // 3) Age (vertical bar)
  charts.age = ensureChart('age', ageRef.value, {
    type: 'bar',
    data: {
      labels: demographicsAge.map(d => d.group),
      datasets: [{ label: 'จำนวน', data: demographicsAge.map(d => d.value), backgroundColor: '#2563eb' }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
  })

  // 4) Occupations (horizontal bar)
  charts.occ = ensureChart('occ', occRef.value, {
    type: 'bar',
    data: {
      labels: occupations.map(d => d.group),
      datasets: [{ label: 'จำนวน', data: occupations.map(d => d.value), backgroundColor: '#10b981' }]
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true } }, plugins: { legend: { display: false } } }
  })

  // 5) Theme prevalence (horizontal bar)
  charts.theme = makeChart(themeRef.value, {
    type: 'bar',
    data: {
      labels: themePrevalence.map(d => d.theme),
      datasets: [{ label: 'จำนวน', data: themePrevalence.map(d => d.value), backgroundColor: '#f59e0b' }]
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true } }, plugins: { legend: { display: false } } }
  })

  // 6) Journey satisfaction (area-like line)
  charts.journey = makeChart(journeyRef.value, {
    type: 'line',
    data: {
      labels: journey.map(d => d.stage),
      datasets: [{
        label: 'คะแนน',
        data: journey.map(d => Number(d.score)),
        borderColor: '#9333ea',
        backgroundColor: 'rgba(147,51,234,0.2)',
        pointRadius: 3,
        tension: 0.3,
        fill: true,
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 5 } }, plugins: { legend: { display: false } } }
  })

  // 7) Impact vs Effort (bubble)
  charts.bubble = makeChart(bubbleRef.value, {
    type: 'bubble',
    data: {
      datasets: [{
        label: 'โครงการ',
        data: recos.map(r => ({ x: Number(r.effort), y: Number(r.impact), r: Number(r.r) })),
        backgroundColor: 'rgba(37,99,235,0.3)',
        borderColor: '#2563eb'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Effort' }, min: 0, max: 10 },
        y: { title: { display: true, text: 'Impact' }, min: 0, max: 10 }
      }
    }
  })
})

onBeforeUnmount(() => {
  Object.values(charts).forEach((ch) => {
    if (ch && typeof ch.destroy === 'function') ch.destroy()
  })
  charts = {}
})
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <div class="title">
        <h1>รายงานสรุปการวิจัย</h1>
        <p class="muted small">Report ID: {{ reportId }} <span v-if="campaignName">• แคมเปญ: {{ campaignName }}</span></p>
      </div>
      <NuxtLink class="btn" to="/">ย้อนกลับ</NuxtLink>
    </div>

    <!-- Table of Contents -->
    <nav class="toc card">
      <a href="#exec"><i class='bx bx-line-chart'></i> Executive Summary</a>
      <a href="#bg"><i class='bx bx-target-lock'></i> Background & Objective</a>
      <a href="#method"><i class='bx bx-collection'></i> Methodology</a>
      <a href="#findings"><i class='bx bx-bulb'></i> Key Findings / Themes</a>
      <a href="#interpret"><i class='bx bx-analyse'></i> Interpretation & Implications</a>
      <a href="#reco"><i class='bx bx-rocket'></i> Recommendations</a>
      <a href="#appendix"><i class='bx bx-library'></i> Appendix</a>
    </nav>

    <!-- 1. Executive Summary -->
    <section id="exec" class="card section">
      <header class="section-head">
        <h2>1. Executive Summary</h2>
        <p class="muted">สรุปภาพรวม objective, จำนวนผู้เข้าร่วม, key insight, recommendation หลัก</p>
      </header>

      <p class="lead">วัตถุประสงค์: {{ executive.objective }}</p>

      <div class="kpi-grid">
        <div class="kpi">
          <span class="label">ผู้เข้าร่วมทั้งหมด</span>
          <span class="value">{{ executive.participants }}</span>
        </div>
        <div class="kpi">
          <span class="label">สำเร็จการสัมภาษณ์</span>
          <span class="value">{{ executive.completes }}</span>
        </div>
        <div class="kpi">
          <span class="label">ระยะเวลาเฉลี่ย</span>
          <span class="value">~{{ executive.avgDurationMin }} นาที</span>
        </div>
      </div>

      <div class="grid2">
        <div>
          <h3 class="sub">Key Insights</h3>
          <ul class="bullets">
            <li v-for="(i, idx) in executive.keyInsights" :key="idx">{{ i }}</li>
          </ul>
        </div>
        <div>
          <h3 class="sub">Recommendations (หลัก)</h3>
          <ul class="bullets">
            <li v-for="(r, idx) in executive.recommendations" :key="idx">{{ r }}</li>
          </ul>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-head">
          <span class="muted">แนวโน้มการเข้าร่วม (7 วัน)</span>
        </div>
        <ClientOnly>
          <div class="chart-wrap h220">
            <canvas ref="lineRef"></canvas>
          </div>
          <template #fallback>
            <div class="chart-fallback" style="height:220px"></div>
          </template>
        </ClientOnly>
      </div>
    </section>

    <!-- 2. Background & Objective -->
    <section id="bg" class="card section">
      <header class="section-head">
        <h2>2. Background & Objective</h2>
      </header>
      <p>ทำไมต้องทำการวิจัยครั้งนี้: เพื่อเข้าใจพฤติกรรม/แรงจูงใจและจุดที่ทำให้เกิดการเปลี่ยนใจ รวมถึงหาคำตอบให้โจทย์ธุรกิจหลัก</p>
      <ul class="bullets">
        <li>สมมติฐาน 1: ผู้ใช้ได้รับอิทธิพลจาก Social proof สูง</li>
        <li>สมมติฐาน 2: ขั้นตอน Onboarding มี Friction สูงในบางรุ่นมือถือ</li>
        <li>Business Questions: อะไรทำให้คนเริ่มใช้/เลิกใช้, ช่องทางใดคุ้มค่าที่สุด, จะลด Drop-off ได้อย่างไร</li>
      </ul>
    </section>

    <!-- 3. Methodology -->
    <section id="method" class="card section">
      <header class="section-head">
        <h2>3. Methodology</h2>
        <p class="muted">ประเภทการวิจัย, ลักษณะผู้ให้สัมภาษณ์, ขั้นตอน, เครื่องมือ, วิธีวิเคราะห์</p>
      </header>

      <div class="grid3">
        <div class="chart-card">
          <div class="chart-head"><strong>เพศ</strong></div>
          <ClientOnly>
            <div class="chart-wrap h220">
              <canvas ref="genderRef"></canvas>
            </div>
            <template #fallback>
              <div class="chart-fallback" style="height:220px"></div>
            </template>
          </ClientOnly>
        </div>
        <div class="chart-card">
          <div class="chart-head"><strong>ช่วงอายุ</strong></div>
          <ClientOnly>
            <div class="chart-wrap h220">
              <canvas ref="ageRef"></canvas>
            </div>
            <template #fallback>
              <div class="chart-fallback" style="height:220px"></div>
            </template>
          </ClientOnly>
        </div>
        <div class="chart-card">
          <div class="chart-head"><strong>อาชีพ</strong></div>
          <ClientOnly>
            <div class="chart-wrap h220">
              <canvas ref="occRef"></canvas>
            </div>
            <template #fallback>
              <div class="chart-fallback" style="height:220px"></div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <div class="meta-grid">
        <div>
          <div class="muted">ประเภท</div>
          <div>{{ interviewMeta.type }}</div>
        </div>
        <div>
          <div class="muted">เครื่องมือ</div>
          <div>{{ interviewMeta.tool }}</div>
        </div>
        <div>
          <div class="muted">จำนวน Interview</div>
          <div>{{ interviewMeta.interviews }}</div>
        </div>
        <div>
          <div class="muted">ระยะเวลาเฉลี่ย</div>
          <div>{{ interviewMeta.duration }}</div>
        </div>
      </div>
      <div class="muted small">ขั้นตอน: {{ interviewMeta.steps.join(' • ') }} | Data analysis: {{ interviewMeta.analysis.join(', ') }}</div>
    </section>

    <!-- 4. Key Findings / Themes -->
    <section id="findings" class="card section">
      <header class="section-head">
        <h2>4. Key Findings / Themes</h2>
        <p class="muted">Theme หลัก / Sub-theme / Supporting Quote และ journey/pattern</p>
      </header>

      <div class="grid2">
        <div class="chart-card">
          <div class="chart-head"><strong>Theme Prevalence</strong></div>
          <ClientOnly>
            <div class="chart-wrap h260">
              <canvas ref="themeRef"></canvas>
            </div>
            <template #fallback>
              <div class="chart-fallback" style="height:260px"></div>
            </template>
          </ClientOnly>
        </div>
        <div class="chart-card">
          <div class="chart-head"><strong>Journey Satisfaction by Stage</strong></div>
          <ClientOnly>
            <div class="chart-wrap h260">
              <canvas ref="journeyRef"></canvas>
            </div>
            <template #fallback>
              <div class="chart-fallback" style="height:260px"></div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <div class="themes">
        <div v-for="(t, i) in themes" :key="i" class="theme">
          <h3>{{ t.name }}</h3>
          <p class="insight">Insight: {{ t.insight }}</p>
          <div class="subthemes">
            <div v-for="(s, j) in t.sub" :key="j" class="subtheme">
              <div class="subhead">
                <strong>{{ s.name }}</strong>
                <span class="pill">n={{ s.count }}</span>
              </div>
              <ul class="quotes">
                <li v-for="(q, k) in s.quotes" :key="k">“{{ q }}”</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Interpretation & Implications -->
    <section id="interpret" class="card section">
      <header class="section-head">
        <h2>5. Interpretation & Implications</h2>
      </header>
      <ul class="bullets">
        <li>Brand Perception แข็งแรงจาก Social proof → ลงทุนคอนเทนต์ UGC และรีวิวจากผู้มีอิทธิพล</li>
        <li>Onboarding Friction → โอกาสลด Drop-off โดยปรับ UX verification และคำแนะนำในแอป</li>
        <li>Gen Z ต้องการ Self-service → เสริมคู่มือแบบภาพ/วิดีโอสั้นและค้นหาช่วยเหลือที่ชัดเจน</li>
      </ul>
      <p class="muted">เชื่อมโยงกับสมมติฐานและโจทย์ธุรกิจ: เพิ่ม Conversion และความไว้วางใจ พร้อมลดต้นทุน Support</p>
    </section>

    <!-- 6. Recommendations / Action Direction -->
    <section id="reco" class="card section">
      <header class="section-head">
        <h2>6. Recommendations / Action Direction</h2>
      </header>

      <div class="grid2">
        <div class="chart-card">
          <div class="chart-head"><strong>Impact vs Effort</strong> (ฟองใหญ่ = Confidence สูง)</div>
          <ClientOnly>
            <div class="chart-wrap h280">
              <canvas ref="bubbleRef"></canvas>
            </div>
            <template #fallback>
              <div class="chart-fallback" style="height:280px"></div>
            </template>
          </ClientOnly>
        </div>
        <div>
          <div class="reco-list">
            <div v-for="(r, idx) in recos" :key="idx" class="reco-item">
              <div class="reco-title"><i class='bx bx-check-circle'></i> {{ r.name }}</div>
              <div class="muted small">Impact: {{ r.impact }} • Effort: {{ r.effort }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Appendix -->
    <section id="appendix" class="card section">
      <header class="section-head">
        <h2>7. Appendix</h2>
      </header>

      <h3 class="sub">ตาราง Quote (ตัวอย่าง)</h3>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Theme</th>
              <th>Quote</th>
              <th>เพศ</th>
              <th>อายุ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in quotes" :key="i">
              <td>{{ row.theme }}</td>
              <td>{{ row.quote }}</td>
              <td>{{ row.gender }}</td>
              <td>{{ row.age }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid3">
        <div>
          <h3 class="sub">Theme Map (ย่อ)</h3>
          <ul class="bullets">
            <li>Brand Perception → Social Proof → Conversion</li>
            <li>Onboarding UX → Verification → Drop-off</li>
            <li>Support & Trust → FAQ/How-to → Retention</li>
          </ul>
        </div>
        <div>
          <h3 class="sub">แบบคำถาม (ย่อ)</h3>
          <ul class="bullets">
            <li v-for="(q, i) in questions" :key="i">{{ q }}</li>
          </ul>
        </div>
        <div>
          <h3 class="sub">Credibility Checklist</h3>
          <ul class="bullets">
            <li v-for="(c, i) in credibility" :key="i"><i class='bx bx-checkbox-checked'></i> {{ c }}</li>
          </ul>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.page { padding: 16px; max-width: 1100px; margin: 0 auto; }
.toolbar { display:flex; justify-content: space-between; align-items:center; margin-bottom: 12px; gap: 12px; flex-wrap: wrap; }
.title h1 { margin: 0; }
.small { font-size: 12px; }

.card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; box-shadow: 0 1px 2px rgba(16,24,40,0.05); }
.section { margin-bottom: 14px; }
.section-head { margin-bottom: 8px; }
.section-head h2 { margin: 0 0 4px; font-size: 18px; }
.lead { margin-top: 6px; }

.muted { color: #6b7280; }
.bullets { padding-left: 18px; margin: 6px 0; }
.bullets li { margin: 4px 0; }

/* KPI tiles */
.kpi-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0; }
.kpi { border: 1px solid #eef2f7; border-radius: 10px; padding: 12px; background: #f9fafb; }
.kpi .label { color:#6b7280; font-size: 12px; }
.kpi .value { font-size: 22px; font-weight: 700; color: #0f172a; }

/* Reuse table style similar to index */
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: separate; border-spacing: 0; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(16,24,40,0.05); }
.table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f1f5f9; }
.table th { background: #f8fafc; color: #0f172a; font-weight: 600; }
.table tr:last-child td { border-bottom: none; }

/* Grids */
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.meta-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }

.chart-card { border: 1px solid #eef2f7; border-radius: 12px; padding: 12px; background: #fff; overflow: hidden; }
.chart-head { font-size: 12px; color:#6b7280; margin-bottom: 6px; display:flex; justify-content: space-between; align-items:center; }
/* Placeholder shown during SSR while ClientOnly charts hydrate */
.chart-fallback { background: #fafafa; border: 1px dashed #e5e7eb; border-radius: 10px; width: 100%; }

/* Fixed-height wrappers to prevent resize feedback loops with Chart.js */
.chart-wrap { position: relative; width: 100%; height: 220px; }
.chart-wrap.h220 { height: 220px; }
.chart-wrap.h260 { height: 260px; }
.chart-wrap.h280 { height: 280px; }
.chart-wrap > canvas { display: block; width: 100% !important; height: 100% !important; }

/* Themes */
.themes { margin-top: 12px; display: grid; gap: 12px; }
.theme { border: 1px solid #eef2f7; border-radius: 12px; padding: 12px; background: #fcfcfd; }
.insight { color:#111827; margin: 6px 0 8px; }
.subthemes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.subtheme { border: 1px solid #eef2f7; border-radius: 10px; padding: 10px; background: #fff; }
.subhead { display:flex; justify-content: space-between; align-items:center; margin-bottom: 6px; }
.pill { background: #eef2ff; color: #2563eb; border: 1px solid #2563eb22; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
.quotes { margin: 0; padding-left: 18px; }

/* TOC */
.toc { display:flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.toc a { display:inline-flex; align-items:center; gap: 6px; padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 999px; text-decoration: none; color:#111827; }
.toc a:hover { background:#f8fafc; }

/* Buttons */
.btn { padding: 8px 12px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; border-radius: 8px; text-decoration: none; color: inherit; }
.btn.primary { background: #2563eb; color: #fff; border-color: #1d4ed8; }

@media (max-width: 900px) {
  .grid2 { grid-template-columns: 1fr; }
  .grid3 { grid-template-columns: 1fr; }
  .meta-grid { grid-template-columns: 1fr 1fr; }
  .kpi-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>
