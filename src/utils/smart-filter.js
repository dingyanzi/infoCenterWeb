/**
 * Smart Filter Utils
 */

export const FILTER_TYPE = {
    EQUAL: 0, // 等于
    CONTAINS: 1, // 包含
    GREATER_THAN_OR_EQUAL: 3, // 大于等于
    LESS_THAN_OR_EQUAL: 5, // 小于等于
    MULTIPLE_EQUAL: 6, // 多个等于
};

/**
 * 构建筛选参数
 * @param {Object} queryForm
 * @param {Object} config e.g. { keywords: FILTER_TYPE.CONTAINS }
 * @returns {Object} { filters: Array, cleanQueryForm: Object }
 */
export function buildFilterParams(queryForm, config) {
    const filters = [];
    const cleanQueryForm = {};
    
    for (const key in queryForm) {
        if (Object.prototype.hasOwnProperty.call(queryForm, key)) {
            if (config[key] !== undefined) {
                const value = queryForm[key];
                // Only add if value is not empty/null/undefined
                if (value !== undefined && value !== null && value !== '') {
                    filters.push({
                        fieldName: key,
                        fieldValue: value,
                        conditionalType: config[key],
                    });
                }
            } else {
                // Add non-filter fields to cleanQueryForm
                cleanQueryForm[key] = queryForm[key];
            }
        }
    }
    
    return { filters, cleanQueryForm };
}
