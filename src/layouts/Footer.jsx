import React from "react";
import ExternalLink from "../components/common/ExternalLink";
import Record from "../resources/ICP";
import FriendLinks from "../components/home/FriendLinks";
import BackgroundImageInfo from "../components/common/BackgroundImageInfo";

// 渲染友情链接组件
const FriendLinksSection = ({ links }) => (
  <FriendLinks
    links={links}
    className="p-2 flex flex-row justify-center space-x-5"
  />
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

const Footer = ({ links, imageName }) => {
  return (
    <footer className="flex flex-col items-center text-gray-400">
      {imageName && (
        <div className="pb-2">
          <BackgroundImageInfo imageName={imageName} />
        </div>
      )}
      <FriendLinksSection links={links} />

      <div className="p-2 flex md:flex-row flex-col items-center justify-center space-x-3">
        <BeianSection />
      </div>
    </footer>
  );
};

export default Footer;
