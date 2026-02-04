import React from "react";
import ExternalLink from "../common/ExternalLink";

const FriendLinks = ({ links = [], className = "" }) => {
  const linkItems = links.map((link) => (
    <ExternalLink
      href={link.url}
      key={link.id}
      referrerPolicy="no-referrer"
    >
      {link.title}
    </ExternalLink>
  ));

  return links.length ? (
    <div className={`flex items-center space-x-2 ${className}`.trim()}>
      <h2>友情链接：</h2>
      {linkItems}
    </div>
  ) : null;
};

export default FriendLinks;
