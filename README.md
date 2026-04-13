# 组件文档

本文档描述了项目中的公共组件，按照目录结构组织，方便开发人员查阅和使用。

## 目录结构

```
src/components/
├── business/         # 业务相关组件
├── framework/        # 框架通用组件
├── support/          # 支持性组件
└── system/           # 系统相关组件
```

## 组件列表

### 1. business 目录

#### 1.1 category-tree-select
- **路径**: `src/components/business/category-tree-select/index.vue`
- **功能**: 目录树形选择组件
- **属性**:
  - `value`: Number，选中的值
  - `placeholder`: String，占位文本，默认为"请选择"
  - `width`: String，组件宽度，默认为"100%"
- **事件**:
  - `update:value`: 更新选中值
  - `change`: 选择变化时触发
- **使用示例**:
  ```vue
  <category-tree-select v-model:value="categoryId" placeholder="请选择目录" />
  ```

#### 1.2 oa 目录

##### 1.2.1 enterprise-bank-select
- **路径**: `src/components/business/oa/enterprise-bank-select/index.vue`
- **功能**: 企业银行选择组件

##### 1.2.2 enterprise-invoice-select
- **路径**: `src/components/business/oa/enterprise-invoice-select/index.vue`
- **功能**: 企业发票选择组件

##### 1.2.3 enterprise-select
- **路径**: `src/components/business/oa/enterprise-select/index.vue`
- **功能**: 企业列表下拉选择框
- **属性**:
  - `value`: Number/String/Object，选中的值
  - `width`: String，组件宽度，默认为"200px"
  - `placeholder`: String，占位文本，默认为"请选择"
  - `size`: String，组件大小，默认为"default"
  - `disabled`: Boolean，是否禁用，默认为false
  - `multiple`: Boolean，是否支持多选，默认为false
  - `type`: Number，企业类型
- **事件**:
  - `update:value`: 更新选中值
  - `change`: 选择变化时触发
- **使用示例**:
  ```vue
  <enterprise-select v-model:value="enterpriseId" placeholder="请选择企业" />
  ```

### 2. framework 目录

#### 2.1 area-cascader
- **路径**: `src/components/framework/area-cascader/index.vue`
- **功能**: 地区选择框
- **属性**:
  - `type`: String，地区类型
  - `value`: Number/Array，选中的值
  - `width`: String，组件宽度，默认为"200px"
  - `placeholder`: String，占位文本，默认为"请选择地区"
  - `size`: String，组件大小，默认为"default"
  - `disabled`: Boolean，是否禁用，默认为false
- **事件**:
  - `update:value`: 更新选中值
  - `change`: 选择变化时触发
- **使用示例**:
  ```vue
  <area-cascader v-model:value="areaValue" type="province_city_district" />
  ```

#### 2.2 boolean-select
- **路径**: `src/components/framework/boolean-select/index.vue`
- **功能**: 布尔值选择组件
- **属性**:
  - `value`: Boolean，选中的值
  - `width`: Number，组件宽度，默认为100
  - `placeholder`: String，占位文本，默认为"请选择"
  - `size`: String，组件大小，默认为"default"
  - `disabled`: Boolean，是否禁用，默认为false
- **事件**:
  - `update:value`: 更新选中值
  - `change`: 选择变化时触发
- **使用示例**:
  ```vue
  <boolean-select v-model:value="isEnabled" />
  ```

#### 2.3 icon-select
- **路径**: `src/components/framework/icon-select/index.vue`
- **功能**: 图标选择组件
- **事件**:
  - `updateIcon`: 选择图标时触发
- **使用示例**:
  ```vue
  <icon-select @updateIcon="handleUpdateIcon">
    <template #iconSelect>
      <a-button type="primary">选择图标</a-button>
    </template>
  </icon-select>
  ```

#### 2.4 iframe
- **路径**: `src/components/framework/iframe/iframe-index.vue`
- **功能**: iframe 嵌入组件
- **属性**:
  - `name`: String，iframe 名称
  - `url`: String，iframe 地址
- **使用示例**:
  ```vue
  <iframe-index name="example" url="https://www.example.com" />
  ```

#### 2.5 smart-copy-icon
- **路径**: `src/components/framework/smart-copy-icon/index.vue`
- **功能**: 复制功能图标
- **属性**:
  - `value`: String/Number，要复制的值
  - `color`: String，图标颜色，默认为"#1890ff"
- **使用示例**:
  ```vue
  <smart-copy-icon :value="copyValue" />
  ```

#### 2.6 smart-enum-checkbox
- **路径**: `src/components/framework/smart-enum-checkbox/index.vue`
- **功能**: 枚举值复选框组件

#### 2.7 smart-enum-radio
- **路径**: `src/components/framework/smart-enum-radio/index.vue`
- **功能**: 枚举值单选框组件

#### 2.8 smart-enum-select
- **路径**: `src/components/framework/smart-enum-select/index.vue`
- **功能**: 枚举值下拉框
- **属性**:
  - `enumName`: String，枚举名称
  - `value`: Number/String，选中的值
  - `width`: String，组件宽度，默认为"100%"
  - `placeholder`: String，占位文本，默认为"请选择"
  - `size`: String，组件大小，默认为"default"
  - `disabled`: Boolean，是否禁用，默认为false
  - `disabledOption`: Array，需要禁用的选项
  - `hiddenOption`: Array，需要隐藏的选项
- **事件**:
  - `update:value`: 更新选中值
  - `change`: 选择变化时触发
- **使用示例**:
  ```vue
  <smart-enum-select v-model:value="status" enumName="STATUS_ENUM" />
  ```

#### 2.9 smart-loading
- **路径**: `src/components/framework/smart-loading/index.js`
- **功能**: 加载状态管理

#### 2.10 text-ellipsis
- **路径**: `src/components/framework/text-ellipsis/index.vue`
- **功能**: 文本省略组件

#### 2.11 wangeditor
- **路径**: `src/components/framework/wangeditor/index.vue`
- **功能**: 富文本编辑器组件

### 3. support 目录

#### 3.1 data-tracer
- **路径**: `src/components/support/data-tracer/index.vue`
- **功能**: 数据追踪组件

#### 3.2 dict-code-select
- **路径**: `src/components/support/dict-code-select/index.vue`
- **功能**: 字典编码选择组件

#### 3.3 dict-label
- **路径**: `src/components/support/dict-label/index.vue`
- **功能**: 字典标签组件

#### 3.4 dict-select
- **路径**: `src/components/support/dict-select/index.vue`
- **功能**: 字典下拉选择框
- **属性**:
  - `dictCode`: String，字典编码
  - `value`: Array/String/Number，选中的值
  - `mode`: String，选择模式，默认为"combobox"
  - `width`: String，组件宽度，默认为"200px"
  - `placeholder`: String，占位文本，默认为"请选择"
  - `size`: String，组件大小，默认为"default"
  - `disabled`: Boolean，是否禁用，默认为false
  - `disabledOption`: Array，需要禁用的选项
  - `hiddenOption`: Array，需要隐藏的选项
- **事件**:
  - `update:value`: 更新选中值
  - `change`: 选择变化时触发
- **使用示例**:
  ```vue
  <dict-select v-model:value="dictValue" dictCode="STATUS" />
  ```

#### 3.5 file-preview
- **路径**: `src/components/support/file-preview/index.vue`
- **功能**: 文件预览组件

#### 3.6 file-preview-modal
- **路径**: `src/components/support/file-preview-modal/index.vue`
- **功能**: 文件预览模态框组件

#### 3.7 file-upload
- **路径**: `src/components/support/file-upload/index.vue`
- **功能**: 文件上传组件

#### 3.8 table-header-cell
- **路径**: `src/components/support/table-header-cell/index.vue`
- **功能**: 表格表头单元格组件

#### 3.9 table-operator
- **路径**: `src/components/support/table-operator/index.vue`
- **功能**: 表格操作组件

### 4. system 目录

#### 4.1 department-tree-select
- **路径**: `src/components/system/department-tree-select/index.vue`
- **功能**: 部门树形选择组件

#### 4.2 employee-select
- **路径**: `src/components/system/employee-select/index.vue`
- **功能**: 员工选择组件

#### 4.3 employee-table-select-modal
- **路径**: `src/components/system/employee-table-select-modal/index.vue`
- **功能**: 员工表格选择模态框组件

#### 4.4 menu-tree-select
- **路径**: `src/components/system/menu-tree-select/index.vue`
- **功能**: 菜单树形选择组件

#### 4.5 position-select
- **路径**: `src/components/system/position-select/index.vue`
- **功能**: 职位选择组件


### 5. 表格组件
- **路径**: `src/components/smartTable/smart-table.vue`
- **功能**: 基于 Ant Design Vue 的智能表格组件，提供表格展示、分页、自定义插槽等功能。
- **属性**:
  - `dataSource`: Array，表格数据源
  - `columns`: Array，表格列配置
  - `rowKey`: String，行键，默认为"id"
  - `scroll`: Object，滚动配置，默认为{ x: 1000, y: 400 }
  - `total`: Number，总条数，默认为0
  - `pageSizeOptions`: Array，分页大小选项，默认为['10', '20', '30', '40', '50']
  - `queryForm`: Object，查询表单，默认为{ currentPage: 1, pageSize: 10 }
- **事件**:
  - `resizeColumn`: 列宽调整时触发
  - `pageChange`: 分页变化时触发
- **插槽**:
  - `action`: 操作列插槽
  - `bodyCell`: 单元格内容插槽
  - `headerCell`: 表头单元格插槽
- **使用示例**:
  ```vue
  <smart-table
    :dataSource="dataSource"
    :columns="columns"
    :total="total"
    :queryForm="queryForm"
    @pageChange="handlePageChange"
  >
    <template #action="{ record }">
      <a-button type="link" @click="handleEdit(record)">编辑</a-button>
      <a-button type="link" @click="handleDelete(record)">删除</a-button>
    </template>
  </smart-table>
  ```

## 总结

以上是项目中所有公共组件的详细文档，包括组件的功能、属性、事件和使用示例。开发人员可以根据需要选择合适的组件来使用，提高开发效率和代码质量。
