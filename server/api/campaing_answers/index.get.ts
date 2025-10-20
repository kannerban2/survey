import { prisma } from '~/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit ?? 200)
  const offset = Number(query.offset ?? 0)
  const cid = query.campaing_id !== undefined ? Number(query.campaing_id) : undefined

  const take = isNaN(limit) ? 200 : Math.min(Math.max(limit, 1), 1000)
  const skip = isNaN(offset) ? 0 : Math.max(offset, 0)
  const hasCid = cid !== undefined && !Number.isNaN(cid)

  if (hasCid) {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, campaing_id, theme, sex, age, job, time_user, created_at, updated_at
      FROM campaing_answer
      WHERE campaing_id = ${cid}
      ORDER BY id DESC
      LIMIT ${take} OFFSET ${skip}
    `
    return { data: rows }
  } else {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, campaing_id, theme, sex, age, job, time_user, created_at, updated_at
      FROM campaing_answer
      ORDER BY id DESC
      LIMIT ${take} OFFSET ${skip}
    `
    return { data: rows }
  }
})
