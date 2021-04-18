
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Home.vue') },
      { path: '/planning', component: () => import('pages/Shift.vue') },
      { path: '/admin', component: () => import('pages/Admin.vue') }
    ]
  }
]

export default routes
