/**
 * 通用工具函数集合
 */

// 格式化日期
export const formatDate = (
  date: Date | number,
  format = 'yyyy-MM-dd HH:mm:ss',
): string => {
  const d = new Date(date);
  const o: Record<string, number> = {
    'M+': d.getMonth() + 1, // 月份
    'd+': d.getDate(), // 日
    'H+': d.getHours(), // 小时
    'h+': d.getHours() % 12, // 12小时制
    'm+': d.getMinutes(), // 分
    's+': d.getSeconds(), // 秒
    'q+': Math.floor((d.getMonth() + 3) / 3), // 季度
    S: d.getMilliseconds(), // 毫秒
  };

  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      `${d.getFullYear()}`.substr(4 - RegExp.$1.length),
    );
  }

  for (const k in o) {
    if (new RegExp(`(${k})`).test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? String(o[k])
          : `00${o[k]}`.substr(String(o[k]).length),
      );
    }
  }

  return format;
};

// 计算儿童年龄
export const calculateAge = (dob: string): string => {
  if (!dob) return '年龄未设置';
  const birthDate = new Date(dob);
  const today = new Date();

  // 计算毫秒差值
  const diffMs = today.getTime() - birthDate.getTime();
  // 将毫秒转换为天数
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // 计算年龄
  const years = Math.floor(diffDays / 365.25);
  const months = Math.floor((diffDays % 365.25) / 30.44); // 30.44为平均每月天数
  const days = Math.floor(diffDays % 30.44);

  // 根据年龄大小返回不同格式
  if (years > 0) {
    return months > 0 ? `${years}岁${months}个月` : `${years}岁`;
  } else if (months > 0) {
    return days > 0 ? `${months}个月${days}天` : `${months}个月`;
  } else {
    return `${days}天`;
  }
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay = 300,
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay = 300,
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      fn(...args);
      lastTime = now;
    }
  };
};

// 本地存储封装
export const storage = {
  set(key: string, value: any): void {
    try {
      localStorage.setItem(
        key,
        typeof value === 'object' ? JSON.stringify(value) : value,
      );
    } catch (error) {
      console.error('存储数据失败:', error);
    }
  },

  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('获取存储数据失败:', error);
      return defaultValue;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('删除存储数据失败:', error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('清空存储数据失败:', error);
    }
  },
};

// 根据字符串生成随机颜色
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }

  return color;
};

// 检查设备类型
export const deviceDetect = () => {
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isWechat = /MicroMessenger/i.test(ua);
  const isMobile = isAndroid || isIOS;

  return {
    isAndroid,
    isIOS,
    isWechat,
    isMobile,
    isDesktop: !isMobile,
  };
};
