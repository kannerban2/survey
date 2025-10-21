import { prisma } from '~/utils/prisma'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cid = query.campaing_id !== undefined ? Number(query.campaing_id) : undefined
  const hasCid = cid !== undefined && !Number.isNaN(cid)

  const whereClause = hasCid ? Prisma.sql`WHERE ca.campaing_id = ${cid}` : Prisma.empty

  const rows = await prisma.$queryRaw<Array<{ theme: string | null; count: bigint | number }>>`
    SELECT COALESCE(ct.name, 'Unknown') AS theme,
           COUNT(*) AS count
    FROM campaing_answer AS ca
    LEFT JOIN campaing_theme AS ct ON ca.theme_id = ct.id
    ${whereClause}
    GROUP BY COALESCE(ct.name, 'Unknown')
    ORDER BY count DESC;
  `

  // Normalize bigint to number for JSON safety in Node/MySQL drivers
  const data = rows.map(r => ({
    theme: r.theme ?? 'Unknown',
    count: typeof r.count === 'bigint' ? Number(r.count) : r.count,
  }))

  return { data }
})
