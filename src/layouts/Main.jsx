import React, { useEffect, useState } from "react";
import projects from "../resources/projects.json";
import Welcome from "../components/home/Welcome";
import ProjectNav from "../components/home/ProjectNav";
import CurrentActivity from "../components/home/CurrentActivity";
import { getDoingText } from "../utils/doing";

export default function Main({ doings }) {
  const [doing, setDoing] = useState("");

  useEffect(() => {
    if (!doings || doings.length === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      const timestampSeconds = Math.floor(Date.now() / 1000);
      setDoing(getDoingText(doings, timestampSeconds));
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
