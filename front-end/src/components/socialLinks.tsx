import { Instagram, Youtube } from "@thesvg/react";
import { SocialIcon } from "react-custom-social-icons";

/* Social Links */
function SocialLinks() {
  return (
    <div className="mb-8 flex flex-row flex-nowrap gap-8 items-center">
      <a href="#" target="_blank">
        <Instagram width={35} height={35} />
      </a>
      <a href="#" target="_blank">
        <SocialIcon size={38} network="twitter" />
      </a>
      <a href="#" target="_blank">
        <Youtube width={35} height={35} />
      </a>
      <a href="#" target="_blank">
        <SocialIcon size={38} network="tiktok" />
      </a>
    </div>
  );
}

export default SocialLinks;
