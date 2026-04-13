export interface EmployeeForm {
  name: string;
  userName: string;
  phone: string;
  gender: number | null; // 强制要求是数字
  avatarUrl: string;
  department: string;
  jobTitle: string;
  entryDate: string | Date; // 字符串或日期对象
}

export interface QueryParam {
  name: '',
  gender: number | null,
  // 不规定类型只定义[]就会出问题，[]代表一个永远为空的元组
  dateRange: string[]
}