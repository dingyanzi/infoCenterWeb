import { getRequest } from '/@/lib/axios';

//获取考勤地域人数统计
export const GetAddressStaticDataApi = {
  getAddressStaticData: () => {
    return getRequest('Person/GetAddressStaticData');
  },
};

//根据地址名称获取外勤人员列表
export const GetPersonByAddressName = {
  getPersonByAddressName: (param) => {
    return getRequest('Person/GetPersonByAddressName', { addressName: param });
  },
};
