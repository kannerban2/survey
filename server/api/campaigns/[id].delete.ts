import { prisma } from '~/utils/prisma'

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }

  const result = await prisma.$executeRaw`DELETE FROM campaing WHERE id = ${id}`

  return { success: true, affectedRows: Number(result) }
})
