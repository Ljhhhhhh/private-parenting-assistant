import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Toast,
  NavBar,
  DotLoading,
  SafeArea,
  Dialog,
  Radio,
  DatePicker,
  Space,
} from 'antd-mobile';
import { childrenApi } from '../../api';
import { ChildCreate } from '../../types/api';
import dayjs from 'dayjs';

const CreateChildPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const onFinish = async (values: { name: string; gender: string }) => {
    if (!birthDate) {
      Dialog.alert({
        content: '请选择宝宝出生日期',
        confirmText: '确定',
      });
      return;
    }

    try {
      setLoading(true);
      
      const childData: ChildCreate = {
        name: values.name,
        gender: values.gender,
        birthday: dayjs(birthDate).format('YYYY-MM-DD'),
      };
      
      await childrenApi.createChild(childData);
      
      Toast.show({
        icon: 'success',
        content: '档案创建成功',
      });
      
      // 创建成功后跳转到首页
      navigate('/');
    } catch (error) {
      console.error('Failed to create child profile:', error);
      Dialog.alert({
        content: '创建档案失败，请稍后再试',
        confirmText: '确定',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateConfirm = (val: Date) => {
    setBirthDate(val);
    setDatePickerVisible(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar className="border-b border-gray-200" onBack={() => navigate(-1)}>
        创建宝宝档案
      </NavBar>
      <SafeArea position="top" />

      <div className="flex-1 p-6">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-center text-primary-600">
            创建宝宝档案
          </h1>
          <p className="mt-2 text-center text-gray-500">
            填写宝宝的基本信息，开启智能育儿之旅
          </p>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          form={form}
          footer={
            <Button
              block
              type="submit"
              color="primary"
              size="large"
              loading={loading}
              disabled={loading}
              className="mt-8 rounded-lg"
            >
              {loading ? <DotLoading color="white" /> : '创建档案'}
            </Button>
          }
          className="animate-slide-up"
        >
          <Form.Item
            name="name"
            label="宝宝姓名/昵称"
            rules={[{ required: true, message: '请输入宝宝姓名或昵称' }]}
          >
            <Input placeholder="请输入宝宝姓名或昵称" clearable />
          </Form.Item>

          <Form.Item
            name="gender"
            label="宝宝性别"
            rules={[{ required: true, message: '请选择宝宝性别' }]}
          >
            <Radio.Group>
              <Space>
                <Radio value="male">男宝宝</Radio>
                <Radio value="female">女宝宝</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="出生日期"
            rules={[{ required: true, message: '请选择宝宝出生日期' }]}
          >
            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              onClick={() => setDatePickerVisible(true)}
            >
              <span className={birthDate ? 'text-black' : 'text-gray-400'}>
                {birthDate
                  ? dayjs(birthDate).format('YYYY年MM月DD日')
                  : '请选择宝宝出生日期'}
              </span>
              <span className="text-primary-500">选择</span>
            </div>
          </Form.Item>
        </Form>

        <DatePicker
          visible={datePickerVisible}
          value={birthDate || new Date()}
          title="选择出生日期"
          max={new Date()}
          onClose={() => setDatePickerVisible(false)}
          onConfirm={handleDateConfirm}
        />

        <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-fade-in">
          <h3 className="text-sm font-medium text-gray-700">温馨提示</h3>
          <p className="mt-1 text-xs text-gray-500">
            创建宝宝档案后，您可以记录宝宝的成长数据，获取个性化的育儿建议和指导。
          </p>
        </div>
      </div>

      <div className="p-4 text-center text-xs text-gray-400 animate-fade-in">
        <p>我们重视您的隐私，所有数据都将被安全加密存储</p>
      </div>
      <SafeArea position="bottom" />
    </div>
  );
};

export default CreateChildPage;
