import React from "react";
import "./nav.css";
import { BiMenu } from "react-icons/bi";
function Nav({ user, togglerNavBar }) {
  return (
    <>
      <header className={user ? "userAvail" : "notAvail"}>
        <div>
          <button onClick={togglerNavBar} className="toggler">
            <BiMenu />
          </button>
        </div>
        <nav className="NavWrapper">
          <h1>KDrive</h1>
        </nav>
      </header>
    </>
  );
}

export default Nav;
