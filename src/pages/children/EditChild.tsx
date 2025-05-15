import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { getChildById, updateChild } from '../../api/children';
import { UpdateChildDto } from '../../types/models'; // ChildResponseDto
import dayjs from 'dayjs';

const EditChildPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form] = Form.useForm();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  // const [child, setChild] = useState<ChildResponseDto | null>(null);

  const fetchChild = async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      const response = await getChildById(Number(id));
      // setChild(response);

      // 设置表单初始值
      form.setFieldsValue({
        name: response.nickname,
        gender: response.gender,
      });

      // 设置出生日期
      setBirthDate(new Date(response.dateOfBirth));
    } catch (error) {
      console.error('Failed to fetch child:', error);
      Dialog.alert({
        content: '获取宝宝档案失败，请稍后再试',
        confirmText: '确定',
        onConfirm: () => navigate('/children'),
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchChild();
  }, [id]);

  const onFinish = async (values: { name: string; gender: string }) => {
    if (!birthDate || !id) {
      Dialog.alert({
        content: '请选择宝宝出生日期',
        confirmText: '确定',
      });
      return;
    }

    try {
      setLoading(true);

      const childData: UpdateChildDto = {
        nickname: values.name,
        gender: values.gender,
        dateOfBirth: dayjs(birthDate).format('YYYY-MM-DD'),
      };

      await updateChild(Number(id), childData);

      Toast.show({
        icon: 'success',
        content: '档案更新成功',
      });

      // 更新成功后返回详情页
      navigate(`/children/${id}`);
    } catch (error) {
      console.error('Failed to update child profile:', error);
      Dialog.alert({
        content: '更新档案失败，请稍后再试',
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

  if (initialLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <NavBar
          className="border-b border-gray-200"
          onBack={() => navigate(-1)}
        >
          编辑宝宝档案
        </NavBar>
        <SafeArea position="top" />
        <div className="flex flex-1 justify-center items-center">
          <DotLoading color="primary" />
          <span className="ml-2">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar className="border-b border-gray-200" onBack={() => navigate(-1)}>
        编辑宝宝档案
      </NavBar>
      <SafeArea position="top" />

      <div className="flex-1 p-6">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-center text-primary-600">
            编辑宝宝档案
          </h1>
          <p className="mt-2 text-center text-gray-500">更新宝宝的基本信息</p>
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
              {loading ? <DotLoading color="white" /> : '保存修改'}
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
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
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

        <div className="p-4 mt-6 bg-gray-50 rounded-lg animate-fade-in">
          <h3 className="text-sm font-medium text-gray-700">温馨提示</h3>
          <p className="mt-1 text-xs text-gray-500">
            更新宝宝档案信息后，我们将根据最新信息为您提供更精准的育儿建议。
          </p>
        </div>
      </div>

      <SafeArea position="bottom" />
    </div>
  );
};

export default EditChildPage;
