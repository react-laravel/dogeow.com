import React from "react";
import ExternalLink from "../components/ExternalLink";
import Record from "../resources/ICP";
import TailwindCSS from "../resources/TailwindCSS.jsx";
import FriendLink from "../components/FriendLink";

// 渲染友情链接组件
const FriendLinksSection = ({ links }) => (
  <FriendLink
    links={links}
    className="p-2 flex flex-row justify-center space-x-5"
  />
);

// 渲染技术支持信息
const PoweredBySection = ({ tailwindCSSLink }) => (
  <div className="flex items-center space-x-1">
    <span className="pl-3">Powered by</span>
    <ExternalLink href={tailwindCSSLink}>
      <TailwindCSS />
    </ExternalLink>
  </div>
);

// 渲染备案信息
const BeianSection = () => (
  <>
    <ExternalLink href="https://beian.miit.gov.cn/">
      闽ICP备19021694号
    </ExternalLink>

    <ExternalLink href="http://www.beian.gov.cn/">
      <figure className="flex items-center">
        <img src={Record} alt="备案图标" style={{ verticalAlign: "top" }} />
        <figcaption>闽公网安备35020302033650号</figcaption>
      </figure>
    </ExternalLink>
  </>
);

const Footer = ({ links, tailwindCSSLink }) => {
  return (
    <footer className="flex flex-col items-center text-gray-400">
      <FriendLinksSection links={links} />

      <div className="p-2 flex md:flex-row flex-col items-center justify-center space-x-3">
        {/* <PoweredBySection tailwindCSSLink={tailwindCSSLink} /> */}
        <BeianSection />
      </div>
    </footer>
  );
};

export default Footer;
