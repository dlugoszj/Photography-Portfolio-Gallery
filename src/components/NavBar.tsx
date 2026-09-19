// import React from "react";

import "./css/Menus.css";
import "../assets/css/fonts.css";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <>
      <div className="nav-bar-home">
        <div className="krzysztof">
          <span className="lg-view">
            <Link to="/">K R Z Y S Z T O F &nbsp; D L U G O S Z</Link>
          </span>
          <span className="sm-view">
            {/* <a href="/tatanka/gallery"> */}
            <Link to="/">
              K R Z Y S Z T O F <br /> D L U G O S Z
            </Link>
            {/* </a> */}
          </span>
        </div>
        <div className="other-menu-opts">
          <Link to="/"> PORTFOLIO </Link>
          {/* TODO Fix these links when a page is created for them */}
          <a href="/tatanka/blog"> BLOG </a>
          <a href="/"> ABOUT </a>
        </div>
      </div>
    </>
  );
};

export default NavBar;
