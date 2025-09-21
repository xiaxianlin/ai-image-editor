# AI 图片编辑器


按照以下要求重构后端：
- 将代码分 3 层，接口层、逻辑层、数据库层
- 每层包含图库模块、风格模块、设置模块、AI 模块
- AI 模块没有数据库层，辅助处理 AI 相关的交互
- 数据库包含以下三个表：
    - 图库表(gallery)
        - id
        - origin_image
        - effect_image
        - total_input_tokens
        - total_ouput_tokens
        - create_at
    - 风格表(style)
        - id
        - name
        - description
        - prompt
        - tags
        - create_at
        - update_at
    - 配置表(setting)
        - id
        - api_url
        - api_key
        - model
        - update_at
    - 消息表(message)
        - id
        - gallery_id
        - role
        - content
        - create_at
- 图库模块包含以下接口：
    - 图片编辑
    - 获取全部图片
    - 批量删除图片
    - 根据消息内容生成风格
- 风格模块包含以下接口：
    - 获取全部风格
    - 添加风格
    - 删除风格
- 设置模块包含以下接口：
    - 保存设置
    - 获取设置
    - 获取 token 使用量（日度、月度、年度）
    
其他要求：
- 严格限制在要求执行，不添加额外功能
- 有不明确的地方可以咨询确认