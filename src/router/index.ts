import {createRouter, createWebHistory} from 'vue-router'
import Index from "@/index/index.vue";
import UserManage from "@/view/UserManage.vue";
import Login from '@/view/Login.vue';
import RoleInfo from "@/view/RoleInfo.vue";
import Welcome from "@/view/Welcome.vue";
import NewsLIst from "@/view/NewsLIst.vue";
import PermissionManage from "@/view/PermissionManage.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', component: Login},
        {
            path: '/dashboard',
            component: Index,
            redirect: '/dashboard/welcome',
            children: [
                {path: '/dashboard/welcome', component: Welcome},
                {path: '/account/user', component: UserManage},
                {path: '/role/list', component: RoleInfo},
                {path: '/content/news', component: NewsLIst},
                {path:'/permission/list',component:PermissionManage}
            ]
        }
    ],
})

export default router
