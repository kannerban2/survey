import { prisma } from '~/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit ?? 100)
  const offset = Number(query.offset ?? 0)

  const lim = isNaN(limit) ? 100 : Math.max(1, Math.min(1000, limit))
  const off = isNaN(offset) ? 0 : Math.max(0, offset)

  const rows = await prisma.$queryRaw<any[]>`
    SELECT id, name, description, scope, status, link, created_at, update_at
    FROM campaing
    ORDER BY id DESC
    LIMIT ${lim} OFFSET ${off}
  `

  return { data: rows }
})
