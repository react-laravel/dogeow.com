import React, { useEffect, useState } from "react";
import projects from "../resources/projects.json";

const DOING_WITH_DOT_MAX_LENGTH = 4; // doing 带小数点后的最大长度（doing 为一个单位），比如 「正在学习 Golang...」，那么长度为 4，其中小数点最长为 3 位。

// 正在做什么事情的文本
const getDoingText = (doings, timestamp) => {
  // 填充后的最大索引
  const doingWithDotMaxIndex = doings.length * DOING_WITH_DOT_MAX_LENGTH - 1;
  // 当前到第几个 doing 和第几个小数点
  const doingAndDotIndex = timestamp % (doingWithDotMaxIndex + 1);
  // 当前到第几个 doing
  const doingIndex = Math.floor(doingAndDotIndex / DOING_WITH_DOT_MAX_LENGTH);
  // 第几个小数点
  const dotCount = doingAndDotIndex % DOING_WITH_DOT_MAX_LENGTH;

  return `正在${doings[doingIndex]}.${".".repeat(dotCount)}`;
};

// 根据时间获取问候语
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    return "夜深了";
  } else if (hour >= 5 && hour < 9) {
    return "早上好";
  } else if (hour >= 9 && hour < 14) {
    return "中午好";
  } else if (hour >= 14 && hour < 18) {
    return "傍晚好";
  } else {
    return "晚上好";
  }
};

// 欢迎组件
const Welcome = () => {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    // 每分钟更新一次问候语
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // 每分钟检查一次

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex justify-center text-4xl">
      {greeting}
    </div>
  );
};

// 项目卡片组件
const ProjectCard = ({ project }) => (
  <a
    className="block p-4 hover:bg-white hover:bg-opacity-20 cursor-pointer"
    href={project.link}
    key={project.id}
    rel="noopener noreferrer"
  >
    <div className="flex flex-col items-center space-y-4">
      <img width="40" src={project.image} alt={project.title} />
      <div>{project.title}</div>
    </div>
  </a>
);

// 项目导航组件
const ProjectNav = ({ projects }) => (
  <nav className="grid gap-2 grid-cols-2 md:grid-cols-4">
    {projects.map((project) => (
      <ProjectCard key={project.id} project={project} />
    ))}
  </nav>
);

// 正在进行的活动组件
const CurrentActivity = ({ doing }) => (
  <div className="flex justify-center text">
    <a
      href="https://lab.dogeow.com/project/1"
      target="_blank"
      rel="noopener noreferrer"
    >
      {doing}
    </a>
  </div>
);

export default function Main({ doings }) {
  const [doing, setDoing] = useState("");

  useEffect(() => {
    if (!doings || doings.length === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      const timestamp = Math.floor(Date.now() / 1000);
      setDoing(getDoingText(doings, timestamp));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [doings]);

  return (
    <main className="mx-auto space-y-8 flex-grow flex flex-col justify-center px-4">
      <Welcome />
      <ProjectNav projects={projects} />
      <CurrentActivity doing={doing} />
    </main>
  );
}
