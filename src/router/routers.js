/*
 * 所有路由入口
 */
import { homeRouters } from './system/home';
import { loginRouters } from './system/login';
import { helpDocRouters } from './support/help-doc';
import NotFound from '/@/views/system/40X/404.vue';
import NoPrivilege from '/@/views/system/40X/403.vue';
//大屏页面
import ScreenFieldWork from '/@/views/system/screen/fieldWork/index.vue';

export const routerArray = [
    ...loginRouters,
    ...homeRouters,
    ...helpDocRouters,
    { path: '/:pathMatch(.*)*', name: '404', component: NotFound },
    { path: '/403', name: '403', component: NoPrivilege },
    { path: '/screen/fieldWork', name: 'screenFieldWork', component: ScreenFieldWork },
];
