import { createRouter, createWebHistory } from 'vue-router';
import { Meteor } from 'meteor/meteor';
import AppLayout from '../layouts/AppLayout.vue';
import Login from '../pages/Login.vue';
import Signup from '../pages/Signup.vue';
import logIn from '../layouts/LoginLayout.vue';
import NotFound from '../layouts/NotFound.vue';
import InsertTeacher from '../pages/InsertTeacher.vue';
import InsertStudent from '../pages/InsertStudent.vue';
import InsertCourse from '../pages/InsertCourse.vue';
import InsertEnrollment from '../pages/InsertEnrollment.vue';

const routes = [
  { path: '/', redirect: '/insertstudent' },
  { path: '/insertstudent', component: InsertStudent, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/insertteacher', component: InsertTeacher, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/insertcourse', component: InsertCourse, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/insertenrollment', component: InsertEnrollment, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/login', component: Login, meta: { requiresAuth: false, layout: logIn} },
  { path: '/signup', component: Signup, meta: { requiresAuth: false,layout: logIn } },
  {
    path: '/:pathMatch(.*)*', // 404 Not Found
    name: 'NotFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!Meteor.userId();
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/signup') && isLoggedIn) {
    next('/insertstudent');
  } else {
    next();
  }
});

export default router;
