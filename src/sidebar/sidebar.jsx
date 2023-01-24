import React, { useContext } from "react";
import { userContext } from "../App";
import { BsFileImage, BsFileMusic } from "react-icons/bs";
import { FaRegFileVideo } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";

import "./sidebar.css";
function Sidebar() {
  const { selectedItem, setSelectedItem } = useContext(userContext);
  return (
    <div className="sidebar">
      <ul>
        <li className="image">
          <button
            className={selectedItem == "Images" ? "selected" : "notSelected"}
            onClick={() => setSelectedItem("Images")}
          >
            <BsFileImage />
          </button>
        </li>
        <li className="audio">
          <button
            className={selectedItem == "Audios" ? "selected" : "notSelected"}
            onClick={() => setSelectedItem("Audios")}
          >
            <BsFileMusic />
          </button>
        </li>
        <li className="video">
          <button
            className={selectedItem == "Videos" ? "selected" : "notSelected"}
            onClick={() => setSelectedItem("Videos")}
          >
            <FaRegFileVideo />
          </button>
        </li>
        <li className="document">
          <button
            className={selectedItem == "Documents" ? "selected" : "notSelected"}
            onClick={() => setSelectedItem("Documents")}
          >
            <IoDocumentTextOutline />
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
