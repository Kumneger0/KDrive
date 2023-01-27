import React, { useRef } from "react";
import Sidebar from "./sidebar/sidebar";
import { UploadFiles } from "./main/main";
import "./sm.css";
import { MdCancel } from "react-icons/md";
function Sm({ shouldDisplay, togglerNavBar }) {
  if (!shouldDisplay) return;
  const smRef = useRef();
  return (
    <div ref={smRef} className="wrapperSm">
      <div className="sideBarSm">
        <Sidebar />
      </div>
      <div className="uploader">
        <UploadFiles />
      </div>
      <div>
        <button onClick={togglerNavBar} className="btnCncelSm">
          <MdCancel />
        </button>
      </div>
    </div>
  );
}

export default Sm;
