export default defineNuxtRouteMiddleware((to, from) => {
    const isLoggedIn = useCookie('auth_token').value

    // ถ้ายังไม่ล็อกอิน และไม่ใช่หน้า login หรือ chatpage
    if (!isLoggedIn && to.path !== '/login' && to.path !== '/chatpage') {
        return navigateTo('/login')
    }

    // ถ้าล็อกอินแล้วแต่พยายามเข้า /login → ส่งไปหน้าแรกแทน
    if (isLoggedIn && to.path === '/login') {
        return navigateTo('/')
    }
})