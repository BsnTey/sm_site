import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/auth/LoginPage.vue';
import ZennoPanel from "../pages/panel/ZennoPanel.vue";
import {useAuthStore} from "../stores/auth.ts";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: LoginPage
        },
        {
            path: '/panel',
            name: 'Panel',
            component: ZennoPanel,
            meta: { requiresAuth: true }
        },
        {
            path: '/',
            redirect: '/panel'
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.apiKey) {
        next('/login');
    } else {
        next();
    }
});

export default router;