import dayjs from 'dayjs';

/**
 * 计算儿童年龄
 * @param birthday 生日字符串 (ISO格式)
 * @returns 格式化的年龄字符串
 */
export const calculateAge = (birthday: string): string => {
  const birthDate = dayjs(birthday);
  const now = dayjs();
  const months = now.diff(birthDate, 'month');
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0) {
    return `${years}岁${remainingMonths > 0 ? remainingMonths + '个月' : ''}`;
  } else {
    return `${months}个月`;
  }
};
