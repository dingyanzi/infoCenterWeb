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
import ScreenCar from '/@/views/system/screen/nuoCar/index.vue';
//Android页面
import AndroidIndex from '/@/views/system/Android/index.vue';//手持-主页面
import AndroidLogin from '/@/views/system/Android/login.vue';//手持-登录页面
import StockCheck from '/@/views/system/Android/stockCheck.vue';//手持-库存盘点


export const routerArray = [
    ...loginRouters,
    ...homeRouters,
    ...helpDocRouters,
    { path: '/:pathMatch(.*)*', name: '404', component: NotFound },
    { path: '/403', name: '403', component: NoPrivilege },
    { path: '/screen/fieldWork', name: 'screenFieldWork', component: ScreenFieldWork },
    { path: '/screen/car', name: 'screenCar', component: ScreenCar },
    { path: '/Android/index', name: 'androidIndex', component: AndroidIndex },
    { path: '/Android/login', name: 'androidLogin', component: AndroidLogin },
    { path: '/Android/stockCheck', name: 'stockCheck', component: StockCheck },
];
