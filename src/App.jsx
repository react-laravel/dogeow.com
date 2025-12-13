import React, { useEffect } from "react";
import Main from "./layouts/Main";
import Footer from "./layouts/Footer";

export default () => {
  const [info, setInfo] = React.useState({
    doings: [],
    links: [],
  });

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

  return (
    <div
      id="app"
      className="min-w-screen h-dvh flex flex-col justify-between bg-random bg-cover bg-center transition-opacity duration-700 text-sm text-gray-200 overflow-hidden"
    >
      <Main doings={info.doings} />
      <Footer links={info.links} />
    </div>
  );
};
