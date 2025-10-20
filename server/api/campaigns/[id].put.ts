import { prisma } from '~/utils/prisma'

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }

  const body = await readBody<{
    name?: string | null
    description?: string | null
    scope?: string | null
    status?: string | null
    link?: string | null
  }>(event)

  // Update with COALESCE to allow partial updates
  await prisma.$executeRaw`UPDATE campaing SET
    name = COALESCE(${body.name ?? null}, name),
    description = COALESCE(${body.description ?? null}, description),
    scope = COALESCE(${body.scope ?? null}, scope),
    status = COALESCE(${body.status ?? null}, status),
    link = COALESCE(${body.link ?? null}, link)
  WHERE id = ${id}`

  const rows = await prisma.$queryRaw<any[]>`SELECT id, name, description, scope, status, link, created_at, update_at FROM campaing WHERE id = ${id}`
  const updated = rows?.[0] ?? null
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return { data: updated }
})
