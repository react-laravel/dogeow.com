import React, { useEffect, useState } from "react";
import { getGreeting } from "../utils/greeting";

const Welcome = () => {
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return <div className="flex justify-center text-4xl">{greeting}</div>;
};

export default Welcome;
