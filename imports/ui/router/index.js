import { createRouter, createWebHistory } from 'vue-router';
import { Meteor } from 'meteor/meteor';
import AppLayout from '../layouts/AppLayout.vue';
import Login from '../pages/Login.vue';
import Signup from '../pages/Signup.vue';
import logIn from '../layouts/LoginLayout.vue';
import NotFound from '../layouts/NotFound.vue';
import Department from '../pages/Department.vue';
import Division from '../pages/Division.vue';
import Employee from '../pages/Employees.vue';
import Position from '../pages/Position.vue';
import Cadidate from '../pages/Cadidate.vue';
import Interview from '../pages/Interview.vue';
import Award from '../pages/Awards.vue';
import Attendance from '../pages/Attendance.vue';
import ReportAttendance from '../pages/ReportAttendance.vue';
import Performance from '../pages/Performance.vue';
import SalaryType from '../pages/SalaryType.vue';
import Shortlist from '../pages/Shortlist.vue';
import SelectCandidate from '../pages/SelectCandidate.vue';
import LeaveType from '../pages/LeaveType.vue';
import LeaveApplication from '../pages/LeaveApplication.vue';
import HR from '../pages/HR.vue';
import SalarySetup from '../pages/SalarySetup.vue';
import SalaryGenerate from '../pages/SalaryGenerate.vue';
import SalaryEmployees from '../pages/SalaryEmployees.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/department', component: Department, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/division', component: Division, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/employee', component: Employee, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/position', component: Position, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/cadidate', component: Cadidate, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/interview', component: Interview, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/attendance', component: Attendance, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/reportattendance', component: ReportAttendance, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/performance', component: Performance, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/salarytype', component: SalaryType, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/shortlist', component: Shortlist, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/selectcandidate', component: SelectCandidate, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/award', component: Award, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/leavetype', component: LeaveType, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/leaveapplication', component: LeaveApplication, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/salarysetup', component: SalarySetup, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/salarygenerate', component: SalaryGenerate, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/salaryemployee', component: SalaryEmployees, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/home', component: HR, meta: { requiresAuth: true, layout: AppLayout } },
  { path: '/login', component: Login, meta: { requiresAuth: false, layout: logIn } },
  { path: '/soriyaAuth', component: Signup, meta: { requiresAuth: false, layout: logIn } },
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
    next('/home');
  } else {
    next();
  }
});

export default router;
