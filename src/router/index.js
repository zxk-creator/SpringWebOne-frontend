import { createRouter, createWebHistory } from "vue-router";

const routes = [{
    path: '/',
    redirect: '/employee'
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
}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
