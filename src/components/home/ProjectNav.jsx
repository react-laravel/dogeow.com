import React from "react";

const ProjectCard = ({ project }) => (
  <a
    className="block p-4 hover:bg-white hover:bg-opacity-20 cursor-pointer"
    href={project.link}
    rel="noopener noreferrer"
  >
    <div className="flex flex-col items-center space-y-4">
      <img width="40" src={project.image} alt={project.title} />
      <div>{project.title}</div>
    </div>
  </a>
);

const ProjectNav = ({ projects }) => (
  <nav className="grid gap-2 grid-cols-2 md:grid-cols-4">
    {projects.map((project) => (
      <ProjectCard key={project.id} project={project} />
    ))}
  </nav>
);

export default ProjectNav;
