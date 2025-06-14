// 导入基础组件
import Button from './base/Button';
import Input from './base/Input';
import Checkbox from './base/Checkbox';
import { AutoResizeTextarea } from './base/AutoResizeTextarea';

// 导入表单与数据录入组件
import Form from './data-entry/Form';
import TimePicker from './data-entry/TimePicker';
import Radio from './data-entry/Radio';
export type { FormInstance } from './data-entry/Form';

// 导入反馈组件
import Toast, { useToast } from './feedback/Toast';
import Dialog, { useDialog } from './feedback/Dialog';
import Loading, { DotLoading } from './feedback/Loading';
import FeatureComingSoon from './feedback/FeatureComingSoon';
import { useFeatureComingSoon } from './feedback/useFeatureComingSoon';

// 导入导航组件
import NavBar from './navigation/NavBar';
import TabBar from './navigation/TabBar';

// 导入数据展示组件
import Tag from './data-display/Tag';
import Progress from './data-display/Progress';
import EmptyState from './EmptyState';

// 导入布局组件
import Card from './layout/Card';
import SafeArea from './layout/SafeArea';

// 导入其他组件
import DonationModal from './DonationModal';

// 默认导出所有组件
export {
  // 基础组件
  Button,
  Input,
  Checkbox,
  AutoResizeTextarea,

  // 表单与数据录入组件
  Form,
  TimePicker,
  Radio,

  // 反馈组件
  Toast,
  useToast,
  Dialog,
  useDialog,
  Loading,
  DotLoading,
  FeatureComingSoon,
  useFeatureComingSoon,

  // 导航组件
  NavBar,
  TabBar,

  // 数据展示组件
  Tag,
  Progress,
  EmptyState,

  // 布局组件
  Card,
  SafeArea,

  // 其他组件
  DonationModal,
};

// 组件分组导出
export const Base = { Button, Input, Checkbox, AutoResizeTextarea };
export const DataEntry = { Form, TimePicker, Radio };
export const Feedback = {
  Toast,
  useToast,
  Dialog,
  useDialog,
  Loading,
  DotLoading,
  FeatureComingSoon,
  useFeatureComingSoon,
};
export const Navigation = { NavBar, TabBar };
export const DataDisplay = { Tag, Progress, EmptyState };
export { default as PWAStatusBar } from './layout/PWAStatusBar';
export const Layout = { Card, SafeArea };
export const Other = { DonationModal };
