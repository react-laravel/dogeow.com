import React from "react";

const BackgroundImageInfo = ({ imageName }) => {
  if (!imageName) {
    return null;
  }

  // 移除文件扩展名（.jpg, .png, .jpeg 等）
  const displayName = imageName.replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, "");

  // 构建 Bing 搜索链接（使用不带扩展名的文件名）
  const bingSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(displayName)}`;

  return (
    <div className="absolute top-6 right-6 z-10">
      <a
        href={bingSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center bg-black bg-opacity-40 hover:bg-opacity-60 text-white px-4 py-2.5 rounded-md text-sm transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-white border-opacity-20"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="truncate max-w-xs">{displayName}</span>
      </a>
    </div>
  );
};

export default BackgroundImageInfo;

