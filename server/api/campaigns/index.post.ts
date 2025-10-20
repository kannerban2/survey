import { prisma } from '~/utils/prisma'

export default defineEventHandler( async (event) => {
  const body = await readBody<{
    name?: string
    description?: string
    scope?: string
    status?: string
    link?: string
  }>(event)

  if (!body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }

  // Insert new record
  await prisma.$executeRaw`INSERT INTO campaing (name, description, scope, status, link) VALUES (
    ${body.name ?? null},
    ${body.description ?? null},
    ${body.scope ?? null},
    ${body.status ?? null},
    ${body.link ?? null}
  )`

  const rows = await prisma.$queryRaw<any[]>`SELECT id, name, description, scope, status, link, created_at, update_at FROM campaing WHERE id = LAST_INSERT_ID()`
  const created = rows?.[0] ?? null

  return { data: created }
})
