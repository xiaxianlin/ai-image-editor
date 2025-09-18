import ImageUpload from "@/components/ImageUpload";
import ImagePreview from "@/components/ImagePreview";
import ChatDialog from "@/components/ChatDialog";
import { useEditorStore } from "@/store/editor";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Image as ImageIcon } from "lucide-react";

export default function Editor() {
  const { originalImage } = useEditorStore();
  usePageTitle("编辑器");

  return (
    <div className="h-screen flex flex-col">
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
