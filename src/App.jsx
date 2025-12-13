import React, { useEffect, useState } from "react";
import Main from "./layouts/Main";
import Footer from "./layouts/Footer";
import BackgroundImageInfo from "./components/BackgroundImageInfo";

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

export default () => {
  const [info, setInfo] = useState({
    doings: [],
    links: [],
  });
  const [backgroundImage, setBackgroundImage] = useState(null);

  // 开关：设置为 true 时才会执行 fetch
  const fetchEnabled = false; // 更改为 true 以再次启用

  useEffect(() => {
    if (!fetchEnabled) return;
    fetch("https://api.dogeow.com/about-me/others")
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
      })
      .catch((error) => {
        console.error("获取数据失败:", error);
      });
  }, [fetchEnabled]);

  // 随机选择一张背景图
  useEffect(() => {
    const randomImageName = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
    const imageUrl = `https://upyun.dogeow.com/wallpaper/${randomImageName}!/fw/1920`;
    
    setBackgroundImage({
      url: imageUrl,
      name: randomImageName,
    });
  }, []);

  // 构建背景图样式
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)), url('${backgroundImage.url}')`,
      }
    : {};

  return (
    <div
      id="app"
      className="min-w-screen h-dvh flex flex-col justify-between bg-cover bg-center transition-opacity duration-700 text-sm text-gray-200 overflow-hidden relative"
      style={backgroundStyle}
    >
      {backgroundImage && <BackgroundImageInfo imageName={backgroundImage.name} />}
      <Main doings={info.doings} />
      <Footer links={info.links} />
    </div>
  );
};
