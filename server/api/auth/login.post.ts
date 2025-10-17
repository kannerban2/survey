import { prisma } from '~/utils/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {

    const body = await readBody<{ username: string; password: string }>(event)
    if (!body?.username || !body?.password) {
        throw createError({ statusCode: 400, statusMessage: 'Missing credentials' })
    }

    const user = await prisma.user.findUnique({ where: { username: body.username } })
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })

    const ok = await bcrypt.compare(body.password, user.passwordhash)
    if (!ok) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })

    const config = useRuntimeConfig()
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.jwtSecret!,
        { expiresIn: '2h' }
    )

    // ตั้งคุกกี้ (dev: httpOnly=false ให้ client middleware อ่านได้ง่าย)
    setCookie(event, 'auth_token', token, {
        path: '/',
        maxAge: 60 * 60 * 2, // 2 ชม.
        sameSite: 'lax',
        httpOnly: false,     // โปรดักชันค่อยเปลี่ยนเป็น true และปรับวิธีตรวจใน server-side
        secure: process.env.NODE_ENV === 'production',
    })

    return {
        user: { id: user.id, username: user.username, role: user.role },
    }
})
