# USYD Campus Tour — 功能测试文档

测试范围：已合并到 `develop` 分支的三个功能模块。

---

## 前置条件

- 本地已运行 `npm run dev`，访问 `http://localhost:3000/admin`
- 已登录管理员账号
- 数据库连接正常

---

## 模块一：批量图片上传（yaxuan/bulk-upload）

### TC-01 按钮点击上传
1. 进入 Admin → **Media**
2. 页面顶部可见 **Bulk Upload Images** 按钮
3. 点击按钮，选择 3 张以上图片（jpg/png）
4. **预期**：进度条显示上传进度（`x/total`），完成后列表自动刷新，图片出现在 Media 列表中
5. **预期**：每张图片的 alt 字段自动填充为文件名（去掉扩展名）

### TC-02 拖拽上传
1. 将多张图片拖入 Media 页面顶部的虚线框区域
2. **预期**：虚线框变蓝色高亮，松开后开始上传，完成后列表刷新

### TC-03 非图片文件过滤
1. 尝试通过按钮或拖拽上传 `.pdf` 或 `.txt` 文件
2. **预期**：弹出提示 "Please select image files."，不执行上传

### TC-04 重复文件检测
1. 上传一张已存在于 Media 库中的同名图片
2. **预期**：弹出 **Duplicate Files Detected** 弹窗，列出重复文件名，提供三个选项：
   - **Cancel**：取消，不上传任何文件
   - **Upload All**：包含重复文件全部上传
   - **Skip Duplicates**：仅上传不重复的文件
3. 分别测试三个选项，验证行为符合预期

### TC-05 上传失败重试
1. 断开网络或制造上传失败，触发部分文件失败
2. **预期**：显示红色失败列表，包含 **Retry All** 按钮
3. 点击 **Retry All**，**预期**：重新上传失败文件，成功后列表刷新

---

## 模块二：Tour 发布校验（Abigail/publish-validation-check）

### TC-06 缺少 floors 时无法发布
1. 创建一个新 Tour，不关联任何 Floor
2. 尝试将状态改为 **Published** 并保存
3. **预期**：报错提示 "Tour has no floors linked. Add at least one floor before publishing."

### TC-07 缺少 defaultFloor 时无法发布
1. 创建一个 Tour，关联了 Floor 但未设置 Default Floor
2. 尝试发布
3. **预期**：报错提示 "Tour has no default floor set."

### TC-08 Floor 无 initialScene 时无法发布
1. Tour 关联的 Floor 未设置 Initial Scene
2. 尝试发布
3. **预期**：报错提示对应 Floor "has no initial scene set."

### TC-09 Floor 无已发布 Scene 时无法发布
1. Floor 下的所有 Scene 均为草稿状态
2. 尝试发布 Tour
3. **预期**：报错提示 "has no published scenes. Publish at least one scene first."

### TC-10 initialScene 未发布时无法发布
1. Floor 的 initialScene 指向一个草稿 Scene
2. 尝试发布 Tour
3. **预期**：报错提示 initialScene "is not published. Publish it before publishing the tour."

### TC-11 Scene 缺少全景图时无法发布
1. 已发布的 Scene 没有设置 panorama 图片
2. 尝试发布 Tour
3. **预期**：报错提示该 Scene "is missing a panorama image."

### TC-12 Portal 热点指向未发布 Scene 时无法发布
1. Scene 中有类型为 `scene` 的 Portal 热点，目标 Scene 为草稿
2. 尝试发布 Tour
3. **预期**：报错提示对应 Portal "points to unpublished scene"

### TC-13 所有条件满足时可以正常发布
1. Tour 关联了 Floor，设置了 defaultFloor
2. Floor 有 initialScene，且该 Scene 已发布、有全景图、Portal 热点目标均已发布
3. 尝试发布
4. **预期**：发布成功，状态变为 Published，无报错

---

## 模块三：Hotspot 拖拽修复（yyx-hotspot-fix）

### TC-14 Hotspot 可视化编辑器正常打开
1. 进入任意已有全景图的 Scene 编辑页面
2. 展开一个 Hotspot，找到 **Visual Picker** 字段
3. 点击打开全景查看器
4. **预期**：全景图正常加载，无报错

### TC-15 拖拽放置 Hotspot
1. 在全景查看器中点击任意位置放置 Hotspot 标记
2. 拖动该标记到新位置
3. **预期**：拖拽结束后不会重复触发点击放置（旧 bug：拖拽后会在拖拽结束位置额外放置一个新标记）
4. **预期**：pitch 和 yaw 字段更新为拖拽后的新坐标

### TC-16 UI 文字为英文
1. 浏览 Scene 编辑页中 Hotspot 相关的 UI 文字
2. **预期**：所有提示文字、按钮标签均为英文，无中文残留

---

## 模块四：全景图格式校验（develop_hz）

### TC-17 选择有效全景图后显示预览
1. 进入 Admin → **Scenes** → 新建或编辑任意 Scene
2. 在 **Panorama Image** 字段选择或上传一张宽高比为 2:1 的图片（如 7680×3840）
3. **预期**：字段下方显示绿色提示 "Valid 360° panorama detected (WxH). Interactive preview ready."
4. **预期**：下方出现可交互的 Pannellum 全景预览，可拖拽浏览

### TC-18 选择无效图片时自动清空并警告
1. 在 Panorama Image 字段选择一张非 2:1 比例的图片（如普通照片 1920×1080）
2. **预期**：弹出红色弹窗 "Invalid 360 Panorama"，显示实际尺寸和提示信息
3. **预期**：关闭弹窗后，Panorama Image 字段自动清空，图片未被选中
4. **预期**：字段下方显示红色提示说明需要 2:1 图片

### TC-19 保存时后端校验拦截无效全景图
1. 若通过某种方式绕过前端校验，设置了非 2:1 比例的图片
2. 点击 Save 保存
3. **预期**：后端 hook 抛出错误，保存被阻止，提示 "The selected image is not a valid 360° panorama. Expected a 2:1 equirectangular image, but received WxH."

### TC-20 未选择图片时显示引导说明
1. 新建 Scene，不选择任何 Panorama Image
2. **预期**：字段下方显示说明面板："Select or upload a panorama image to validate its 2:1 aspect ratio and preview it interactively."

### TC-21 字段描述文字正确显示
1. 在 Scene 编辑页查看 Panorama Image 字段
2. **预期**：字段说明文字为 "Upload or select an equirectangular 360 panorama with a 2:1 aspect ratio, such as 7680x3840."

---

## 模块五：场景切换过渡动画（Scene_Transition_Animation）

> 注意：过渡系统文件已合并，但尚未接入 TourViewer/PannellumViewer。以下测试用例供过渡系统集成完成后使用。

### TC-22 过渡设置面板可正常打开
1. 打开任意已发布的 Tour 前端页面（`/tour/<tourSlug>/<floorSlug>/<sceneSlug>`）
2. 点击页面右下角的齿轮图标按钮
3. **预期**：弹出过渡动画设置面板，包含以下内容：
   - "启用过渡动画" 开关（默认开启）
   - 同楼层切换效果下拉选择器（默认：portal）
   - 跨楼层切换效果下拉选择器（默认：zoomIn）
   - 效果预览按钮

### TC-23 禁用过渡动画后切换无动画
1. 打开过渡设置面板，关闭 "启用过渡动画" 开关
2. 点击场景中的 Portal 热点切换到另一个 Scene
3. **预期**：场景切换立即完成（约 100ms 快速淡入淡出），无明显过渡动画

### TC-24 同楼层切换触发正确的过渡效果（默认 portal）
1. 确保过渡动画已启用，同楼层效果为 "传送门效果"
2. 点击 Portal 热点切换至同楼层的另一个 Scene
3. **预期**：触发橙色光晕从点击位置扩散的传送门动画（约 1200ms），动画完成后新场景加载完毕

### TC-25 跨楼层切换触发正确的过渡效果（默认 zoomIn）
1. 点击跨楼层的 Portal 热点
2. **预期**：触发黑色圆形从中心扩散的缩放进入动画，动画完成后跳转至目标楼层场景

### TC-26 各过渡效果预览正常播放
1. 打开过渡设置面板
2. 逐一点击各效果的"预览"按钮，测试以下效果：
   - **fade**：全屏黑色淡入淡出（800ms）
   - **portal**：橙色光晕从中心扩散（1200ms）
   - **zoomIn**：黑色圆形从中心扩散（1000ms）
   - **zoomRotate**：旋转方形遮罩（1200ms）
   - **blur**：全屏模糊效果（800ms）
   - **flash**：白光闪烁（600ms）
   - **wipeLeft**：从右向左黑色擦除（1000ms）
3. **预期**：每种效果独立播放，持续时间符合括号内描述，播放完毕后自动消失

### TC-27 快速预览面板可正常使用
1. 打开设置面板，在底部 "快速预览所有效果" 区域
2. 点击任意效果按钮
3. **预期**：动画正在播放时，其他效果按钮变灰（disabled 状态），不可点击
4. **预期**：动画结束后按钮恢复可点击状态

### TC-28 切换效果预设后生效
1. 在设置面板将同楼层效果改为 "模糊过渡"
2. 关闭面板，点击同楼层 Portal 热点
3. **预期**：切换时显示模糊过渡效果，而非默认的传送门效果

### TC-29 过渡动画期间热点不可点击
1. 触发场景切换动画
2. 在动画进行过程中尝试再次点击热点
3. **预期**：动画完成前热点点击无响应，不触发新的切换

---

## 回归测试

| 检查项 | 预期结果 |
|--------|---------|
| Media 单张上传（Create New）仍可用 | 正常上传，alt 自动填充 |
| 删除被引用的 Media 报错 | 提示不能删除 |
| Tour/Scene 草稿保存正常 | 保存为草稿不触发发布校验 |
| Admin 后台整体无控制台报错 | 无红色 Error |
