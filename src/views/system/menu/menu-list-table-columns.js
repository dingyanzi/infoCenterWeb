/*
 *  菜单表格列
 *
 * @Author:    1024创新实验室-主任：卓大
 * @Date:      2022-05-12 19:46:11
 * @Wechat:    zhuda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// 使用函数返回列配置，以便在 setup 中调用
export function useColumns() {
  const { t } = useI18n();
  
  return computed(() => [
    {
      title: t('menu.column.name'),
      dataIndex: 'menuName',
      key: 'ID',
      width: 220,
    },
    {
      title: t('menu.column.type'),
      dataIndex: 'menuType',
      width: 100,
      align: "center"
    },
    {
      title: t('menu.column.icon'),
      dataIndex: 'icon',
      width: 50,
    },
    {
      title: t('menu.column.path'),
      dataIndex: 'path',
      ellipsis: true,
    },
    {
      title: t('menu.column.component'),
      dataIndex: 'component',
      ellipsis: true,
    },
    // {
    //   title: '后端权限',
    //   dataIndex: 'apiPerms',
    //   ellipsis: true,
    // },
    {
      title: t('menu.column.webPerms'),
      dataIndex: 'webPerms',
      ellipsis: true,
    },
    {
      title: t('menu.column.sort'),
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: t('menu.column.operate'),
      dataIndex: 'operate',
      width: 250,
      align: "center"
    },
  ]);
}

// 为了向后兼容，保留原来的导出
import { ref } from 'vue';
export const columns = ref([
  {
    title: '名称',
    dataIndex: 'menuName',
    key: 'ID',
    width: 220,
  },
  {
    title: '类型',
    dataIndex: 'menuType',
    width: 100,
    align: "center"
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: 50,
  },
  {
    title: '路径',
    dataIndex: 'path',
    ellipsis: true,
  },
  {
    title: '组件',
    dataIndex: 'component',
    ellipsis: true,
  },
  // {
  //   title: '后端权限',
  //   dataIndex: 'apiPerms',
  //   ellipsis: true,
  // },
  {
    title: '前端权限',
    dataIndex: 'webPerms',
    ellipsis: true,
  },
  {
    title: '顺序',
    dataIndex: 'sort',
    width: 80,
  },
  {
    title: '操作',
    dataIndex: 'operate',
    width: 250,
    align: "center"
  },
]);
