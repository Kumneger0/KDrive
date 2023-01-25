import React from "react";
import "./nav.css";
function Nav({ user }) {
  return (
    <>
      <header className={user ? "userAvail" : "notAvail"}>
        <nav className="NavWrapper">
          <h1>KDrive</h1>
        </nav>
      </header>
    </>
  );
}

export default Nav;
