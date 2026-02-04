import React from "react";

const ExternalLink = ({
  href,
  children,
  newTab,
  referrer,
  referrerPolicy,
}) => {
  const shouldOpenNewTab = newTab ?? !referrer;
  const resolvedReferrerPolicy = referrerPolicy ?? (referrer ? "no-referrer" : undefined);

  return (
    <a
      className="block"
      href={href}
      target={shouldOpenNewTab ? "_blank" : undefined}
      rel={shouldOpenNewTab ? "noopener noreferrer" : undefined}
      referrerPolicy={resolvedReferrerPolicy}
    >
      {children}
    </a>
  );
};

export default ExternalLink;
