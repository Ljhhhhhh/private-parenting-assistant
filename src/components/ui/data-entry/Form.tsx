import React, {
  useRef,
  useImperativeHandle,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

// 表单实例接口
export interface FormInstance {
  getFieldValue: (name: string) => any;
  setFieldValue: (name: string, value: any) => void;
  validateFields: () => Promise<Record<string, any>>;
  resetFields: () => void;
}

// 表单属性接口
interface FormProps {
  form?: React.MutableRefObject<FormInstance | null>;
  layout?: 'vertical' | 'horizontal';
  onFinish?: (values: Record<string, any>) => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// 表单项验证器结构
interface FormItemValidator {
  validate: (value: any) => { valid: boolean; message: string };
}

// 表单上下文接口
interface FormContextType {
  fieldsRef: React.MutableRefObject<Record<string, any>>;
  fieldsNameRef: React.MutableRefObject<Record<string, string>>;
  itemValidatorsRef: React.MutableRefObject<Record<string, FormItemValidator>>;
  layout?: 'vertical' | 'horizontal';
  registerItemValidator: (name: string, validator: FormItemValidator) => void;
}

// 创建表单上下文
const FormContext = createContext<FormContextType>({
  fieldsRef: { current: {} },
  fieldsNameRef: { current: {} },
  itemValidatorsRef: { current: {} },
  layout: 'vertical',
  registerItemValidator: () => {},
});

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
  // 存储表单项验证器
  const itemValidatorsRef = useRef<Record<string, FormItemValidator>>({});

  // 注册表单项验证器
  const registerItemValidator = (
    name: string,
    validator: FormItemValidator,
  ) => {
    if (name) {
      itemValidatorsRef.current[name] = validator;
    }
  };

  // 暴露表单实例方法
  useImperativeHandle(form, () => ({
    getFieldValue: (name) => fieldsRef.current[name],
    setFieldValue: (name, value) => {
      fieldsRef.current[name] = value;
    },
    validateFields: async () => {
      // 完整表单验证实现
      const errors: Record<string, string> = {};

      // 遍历所有已注册的表单项进行验证
      for (const name of Object.keys(fieldsNameRef.current)) {
        const value = fieldsRef.current[name];
        const validator = itemValidatorsRef.current[name];

        // 如果有验证器，执行验证
        if (validator) {
          const result = validator.validate(value);
          if (!result.valid) {
            errors[name] = result.message;
          }
        }
      }

      // 如果有错误，拒绝Promise
      if (Object.keys(errors).length > 0) {
        return Promise.reject({ errors, values: fieldsRef.current });
      }

      // 验证通过，返回表单值
      return Promise.resolve(fieldsRef.current);
    },
    resetFields: () => {
      // 重置所有表单项
      fieldsRef.current = {};
    },
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFinish) {
      // 提交前验证所有字段
      const instance = form?.current;
      if (instance) {
        instance
          .validateFields()
          .then((values) => {
            onFinish(values);
          })
          .catch(() => {
            // 验证失败，不调用onFinish
          });
      } else {
        onFinish(fieldsRef.current);
      }
    }
  };

  // 提供表单上下文
  const formContext = {
    fieldsRef,
    fieldsNameRef,
    itemValidatorsRef,
    layout,
    registerItemValidator,
  };

  return (
    <FormContext.Provider value={formContext}>
      <form
        className={`flex flex-col ${
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
  const formContext = useContext(FormContext);

  // 状态管理
  const [value, setValue] = useState<any>('');
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);

  // 创建校验函数
  const validate = (val: any): { valid: boolean; message: string } => {
    if (!rules.length) return { valid: true, message: '' };

    for (const rule of rules) {
      if (rule.required && (val === undefined || val === null || val === '')) {
        const message = rule.message || '必填项';
        setError(message);
        return { valid: false, message };
      }

      if (
        rule.type === 'email' &&
        val &&
        !/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(val)
      ) {
        const message = rule.message || '邮箱格式不正确';
        setError(message);
        return { valid: false, message };
      }

      if (rule.len && val && val.length !== rule.len) {
        const message = rule.message || `长度需为${rule.len}`;
        setError(message);
        return { valid: false, message };
      }

      if (rule.pattern && val && !rule.pattern.test(val)) {
        const message = rule.message || '格式不正确';
        setError(message);
        return { valid: false, message };
      }
    }

    setError('');
    return { valid: true, message: '' };
  };

  // 如果有name，注册到表单中
  useEffect(() => {
    if (name) {
      formContext.fieldsNameRef.current[name] = name;

      // 注册验证器
      formContext.registerItemValidator(name, { validate });

      // 初始值设置
      const initialValue = formContext.fieldsRef.current[name] || '';
      setValue(initialValue);

      // 组件卸载时清理
      return () => {
        if (name) {
          delete formContext.fieldsNameRef.current[name];
          delete formContext.itemValidatorsRef.current[name];
        }
      };
    }
  }, [name, formContext]);

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

    // 验证
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

        {error && touched && (
          <div className="mt-1 text-sm text-red-500">{error}</div>
        )}

        {extra && <div className="mt-1">{extra}</div>}
      </div>
    </div>
  );
};

Form.Item = FormItem;

export default Form;
