import ImageUpload from "@/components/ImageUpload";
import ImagePreview from "@/components/ImagePreview";
import ChatDialog from "@/components/ChatDialog";
import ConfigRequiredModal from "@/components/ConfigRequiredModal";
import { useEditorStore } from "@/store/editor";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useConfigCheck } from "@/hooks/useConfigCheck";
import { Image as ImageIcon } from "lucide-react";

export default function Editor() {
  const { originalImage } = useEditorStore();
  const { isConfigured, isLoading, errors } = useConfigCheck();
  usePageTitle("编辑器");

  // 如果配置检查未完成，显示加载状态
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在检查配置...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 配置检查模态框 */}
      <ConfigRequiredModal
        isOpen={!isConfigured}
        errors={errors}
      />

      {/* 头部 */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">AI 图片编辑器</h1>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* 条件渲染：未上传图片时显示上传组件 */}
        {!originalImage && (
          <div className="w-1/2 p-3">
            <ImageUpload />
          </div>
        )}

        {/* 图片预览 - 仅在有图片时显示 */}
        {originalImage && (
          <div className="w-1/2 p-3">
            <ImagePreview />
          </div>
        )}

        {/* 右侧 - AI 对话 */}
        <div className="w-1/2 p-3">
          <ChatDialog />
        </div>
      </div>
    </div>
  );
}
