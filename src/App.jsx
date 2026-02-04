import React, { useEffect, useMemo, useState } from "react";
import Main from "./layouts/Main";
import Footer from "./layouts/Footer";

const DEFAULT_INFO = {
  doings: [],
  links: [],
};

// 背景图文件名列表
const BACKGROUND_IMAGES = [
  "AIR.jpg",
  "中世纪-骑士.jpeg",
  "钢铁侠.jpg",
  "你的名字.jpg",
  "守望先锋.jpg",
  "星球大战.jpg",
  "福特野马.jpg",
  "速度生活.jpg",
  "守望先锋.png",
  "冰与火之歌.png",
  "疯狂动物城.png",
  "塞尔达荒野之息.jpg",
];

const BACKGROUND_IMAGE_BASE_URL = "https://upyun.dogeow.com/wallpaper";
const ABOUT_ME_API_URL = "https://api.dogeow.com/about-me/others";
const FETCH_ENABLED = false; // 更改为 true 以再次启用

export default () => {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    if (!FETCH_ENABLED) return;
    fetch(ABOUT_ME_API_URL)
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
      })
      .catch((error) => {
        console.error("获取数据失败:", error);
      });
  }, []);

  // 随机选择一张背景图
  useEffect(() => {
    const randomImageName = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
    const imageUrl = `${BACKGROUND_IMAGE_BASE_URL}/${randomImageName}!/fw/1920`;
    
    setBackgroundImage({
      url: imageUrl,
      name: randomImageName,
    });
  }, []);

  // 构建背景图样式
  const backgroundStyle = useMemo(
    () =>
      backgroundImage
        ? {
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)), url('${backgroundImage.url}')`,
          }
        : {},
    [backgroundImage]
  );

  return (
    <div
      id="app"
      className="min-w-screen h-dvh flex flex-col justify-between bg-cover bg-center transition-opacity duration-700 text-sm text-gray-200 overflow-hidden relative"
      style={backgroundStyle}
    >
      <Main doings={info.doings} />
      <Footer links={info.links} imageName={backgroundImage?.name} />
    </div>
  );
};
