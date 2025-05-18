import React, { useRef, useImperativeHandle } from 'react';

export interface FormInstance {
  getFieldValue: (name: string) => any;
  setFieldValue: (name: string, value: any) => void;
  validateFields: () => Promise<Record<string, any>>;
  resetFields: () => void;
}

interface FormProps {
  form?: React.MutableRefObject<FormInstance | null>;
  layout?: 'vertical' | 'horizontal';
  onFinish?: (values: Record<string, any>) => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Form: React.FC<FormProps> & { Item: typeof FormItem } = ({
  form,
  layout = 'vertical',
  onFinish,
  footer,
  children,
  className = '',
}) => {
  // 存储表单数据的引用
  const fieldsRef = useRef<Record<string, any>>({});
  // 存储表单项名称与组件映射关系
  const fieldsNameRef = useRef<Record<string, string>>({});

  // 暴露表单实例方法
  useImperativeHandle(form, () => ({
    getFieldValue: (name) => fieldsRef.current[name],
    setFieldValue: (name, value) => {
      fieldsRef.current[name] = value;
    },
    validateFields: async () => {
      // 简化版校验，实际校验在Item组件中
      return Promise.resolve(fieldsRef.current);
    },
    resetFields: () => {
      fieldsRef.current = {};
      // 重置所有表单项
      Object.keys(fieldsRef.current).forEach((key) => {
        delete fieldsRef.current[key];
      });
    },
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFinish) {
      onFinish(fieldsRef.current);
    }
  };

  // 提供表单上下文
  const formContext = React.useMemo(
    () => ({
      fieldsRef,
      fieldsNameRef,
      layout,
    }),
    [layout],
  );

  return (
    <FormContext.Provider value={formContext}>
      <form
        className={`flex flex-col gap-4 ${
          layout === 'vertical' ? '' : 'flex-row items-center gap-x-4'
        } ${className}`}
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div
          className={`flex flex-col ${
            layout === 'vertical' ? 'gap-4' : 'gap-2'
          } w-full`}
        >
          {children}
        </div>
        {footer && <div className="mt-4">{footer}</div>}
      </form>
    </FormContext.Provider>
  );
};

// 表单上下文
interface FormContextType {
  fieldsRef: React.MutableRefObject<Record<string, any>>;
  fieldsNameRef: React.MutableRefObject<Record<string, string>>;
  layout?: 'vertical' | 'horizontal';
}

const FormContext = React.createContext<FormContextType>({
  fieldsRef: { current: {} },
  fieldsNameRef: { current: {} },
  layout: 'vertical',
});

// 表单项接口
interface FormItemProps {
  name?: string;
  label?: React.ReactNode;
  rules?: {
    required?: boolean;
    message?: string;
    type?: string;
    len?: number;
    pattern?: RegExp;
    validator?: (value: any) => Promise<void>;
  }[];
  valuePropName?: string;
  extra?: React.ReactNode;
  children: React.ReactElement<any>;
  className?: string;
}

const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  rules = [],
  valuePropName = 'value',
  extra,
  children,
  className = '',
}) => {
  // 使用表单上下文
  const formContext = React.useContext(FormContext);

  // 状态管理
  const [value, setValue] = React.useState<any>('');
  const [error, setError] = React.useState<string>('');
  const [touched, setTouched] = React.useState(false);

  // 如果有name，注册到表单中
  React.useEffect(() => {
    if (name) {
      formContext.fieldsNameRef.current[name] = name;
    }
  }, [name, formContext]);

  // 校验函数
  const validate = (val: any): boolean => {
    if (!rules.length) return true;

    for (const rule of rules) {
      if (rule.required && (val === undefined || val === null || val === '')) {
        setError(rule.message || '必填项');
        return false;
      }

      if (
        rule.type === 'email' &&
        val &&
        !/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(val)
      ) {
        setError(rule.message || '邮箱格式不正确');
        return false;
      }

      if (rule.len && val && val.length !== rule.len) {
        setError(rule.message || `长度需为${rule.len}`);
        return false;
      }

      if (rule.pattern && val && !rule.pattern.test(val)) {
        setError(rule.message || '格式不正确');
        return false;
      }
    }

    setError('');
    return true;
  };

  // 处理值变化
  const handleChange = (e: any) => {
    const val = e?.target?.[valuePropName] ?? e;
    setValue(val);

    // 如果有name，更新表单值
    if (name) {
      formContext.fieldsRef.current[name] = val;
    }

    if (!touched) {
      setTouched(true);
    }

    validate(val);

    if (children.props.onChange) {
      children.props.onChange(e);
    }
  };

  // 处理失焦校验
  const handleBlur = (e: any) => {
    if (!touched) {
      setTouched(true);
      validate(value);
    }

    if (children.props.onBlur) {
      children.props.onBlur(e);
    }
  };

  // 布局类名
  const layoutClass =
    formContext.layout === 'horizontal' ? 'flex items-center' : 'flex flex-col';

  return (
    <div className={`${layoutClass} ${className}`}>
      {label && formContext.layout === 'horizontal' && (
        <label className="flex-shrink-0 w-24 pr-2 text-base font-medium text-text-primary">
          {label}
        </label>
      )}

      <div
        className={`${
          formContext.layout === 'horizontal' ? 'flex-1' : 'w-full'
        }`}
      >
        {label && formContext.layout === 'vertical' && (
          <label className="mb-1 text-base font-medium text-text-primary">
            {label}
          </label>
        )}

        {React.cloneElement(children as React.ReactElement<any>, {
          [valuePropName]: value,
          onChange: handleChange,
          onBlur: handleBlur,
          error: touched ? error : '',
        })}

        {extra && <div className="mt-1">{extra}</div>}
      </div>
    </div>
  );
};

Form.Item = FormItem;

export default Form;
