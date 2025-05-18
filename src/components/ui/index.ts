// 导入基础组件
import Button from './base/Button';
import Input from './base/Input';
import Checkbox from './base/Checkbox';

// 导入表单与数据录入组件
import Form from './data-entry/Form';
export type { FormInstance } from './data-entry/Form';

// 导入反馈组件
import Toast, { useToast } from './feedback/Toast';
import Dialog, { useDialog } from './feedback/Dialog';
import Loading, { DotLoading } from './feedback/Loading';

// 导入导航组件
import NavBar from './navigation/NavBar';
import TabBar from './navigation/TabBar';

// 导入数据展示组件
import Tag from './data-display/Tag';
import Progress from './data-display/Progress';

// 导入布局组件
import Card from './layout/Card';
import SafeArea from './layout/SafeArea';

// 默认导出所有组件
export {
  // 基础组件
  Button,
  Input,
  Checkbox,

  // 表单与数据录入组件
  Form,

  // 反馈组件
  Toast,
  useToast,
  Dialog,
  useDialog,
  Loading,
  DotLoading,

  // 导航组件
  NavBar,
  TabBar,

  // 数据展示组件
  Tag,
  Progress,

  // 布局组件
  Card,
  SafeArea,
};

// 组件分组导出
export const Base = { Button, Input, Checkbox };
export const DataEntry = { Form };
export const Feedback = {
  Toast,
  useToast,
  Dialog,
  useDialog,
  Loading,
  DotLoading,
};
export const Navigation = { NavBar, TabBar };
export const DataDisplay = { Tag, Progress };
export const Layout = { Card, SafeArea };
