import { MarkdownRenderer } from './MarkdownRenderer';

const sampleMarkdown = `# 宝宝的成长建议

## 📊 今日总结
你的宝宝今天表现很好！以下是一些关键指标：

### 📈 成长数据
- **身高**: 75cm (+0.5cm)
- **体重**: 10.2kg (+0.1kg) 
- **头围**: 46cm (正常范围)

### 🍼 喂养情况
1. **母乳喂养**: 6次，每次约20分钟
2. **辅食**: 
   - 早餐：米糊 + 香蕉泥
   - 午餐：胡萝卜泥 + 苹果汁
   - 晚餐：南瓜粥

### 💤 睡眠模式
> 宝宝的睡眠质量很重要！今天的睡眠表现：

- 夜间睡眠：22:00 - 06:30 (8.5小时)
- 白天小憩：2次，共3小时
- **总睡眠时长**: 11.5小时 ✅

### 🎯 明日建议

\`\`\`
📝 注意事项：
1. 继续观察宝宝的食欲变化
2. 适当增加户外活动时间
3. 保持规律的作息时间
\`\`\`

**重要提醒**: 如发现任何异常情况，请及时咨询儿科医生。

---

*数据来源：智能育儿助手 - 让每一天都充满爱与关怀* ❤️`;

export const MarkdownDemo = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          📝 Markdown 渲染效果演示
        </h2>
        <div className="border-t border-gray-200 pt-4">
          <MarkdownRenderer content={sampleMarkdown} />
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🎨 支持的 Markdown 功能
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">文本格式</h4>
            <ul className="space-y-1">
              <li>• 标题 (H1-H6)</li>
              <li>• **粗体**</li>
              <li>• *斜体*</li>
              <li>• ~~删除线~~</li>
              <li>• `行内代码`</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">结构元素</h4>
            <ul className="space-y-1">
              <li>• 有序/无序列表</li>
              <li>• 引用块</li>
              <li>• 代码块</li>
              <li>• 表格</li>
              <li>• 分割线</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
