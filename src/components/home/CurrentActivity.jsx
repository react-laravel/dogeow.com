import React from "react";

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

export default CurrentActivity;
