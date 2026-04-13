import { createRouter, createWebHistory } from "vue-router";

const routes = [{
    path: '/',
    redirect: '/login'
},
{
    path: '/employee',
    name: 'EmployeeList',
    component: () => import('../view/Employee.vue')
},
{
    path: '/OldGetData',
    name: 'OldGetDataTest',
    component: () => import("../view/OldGetData.vue")
},
{
    path: '/login',
    name: '登录',
    component: () => import('../view/Login.vue')
}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
