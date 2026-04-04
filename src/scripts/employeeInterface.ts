export interface EmployeeForm {
  name: string;
  userName: string;
  phone: string;
  gender: string; // 强制要求是数字
  avatarUrl: string;
  department: string;
  jobTitle: string;
  entryDate: string | Date; // 字符串或日期对象
}