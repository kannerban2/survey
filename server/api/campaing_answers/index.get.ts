import { prisma } from '~/utils/prisma'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit ?? 200)
  const offset = Number(query.offset ?? 0)
  const cid = query.campaing_id !== undefined ? Number(query.campaing_id) : undefined

  const take = isNaN(limit) ? 200 : Math.min(Math.max(limit, 1), 1000)
  const skip = isNaN(offset) ? 0 : Math.max(offset, 0)
  const hasCid = cid !== undefined && !Number.isNaN(cid)

    const whereClause = hasCid ? Prisma.sql`WHERE ca.campaing_id = ${cid}` : Prisma.empty;

    const rows = await prisma.$queryRaw<any[]>`
        SELECT ca.id,
               ca.campaing_id,
               c.name  AS campaing_name,
               ca.theme_id,
               ct.name AS theme,
               ca.sex,
               ca.age,
               ca.job,
               ca.time_user,
               ca.created_at,
               ca.updated_at
        FROM campaing_answer AS ca
                 LEFT JOIN campaing AS c ON ca.campaing_id = c.id
                 LEFT JOIN campaing_theme AS ct ON ca.theme_id = ct.id
            ${whereClause}
        ORDER BY ca.id DESC
            LIMIT ${take}
        OFFSET ${skip};
    `

    return { data: rows }

})
