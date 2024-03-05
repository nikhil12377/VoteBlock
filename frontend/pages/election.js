import Head from "next/head";
import React, { useEffect, useState } from "react";
import Candidate from "../components/Candidate";
import Information from "../components/Information";
import Result from "../components/Result";
import VoterLogin from "../components/VoterLogin";
import VoterReg from "../components/VoterReg";
import Voting from "../components/Voting";

export default function Temp() {
  const [Component, setComponent] = useState("Information");

  const Components = {
    Information: Information,
    Candidate: Candidate,
    VoterReg: VoterReg,
    VoterLogin: VoterLogin,
    Voting: Voting,
    Result: Result,
  };
  let SpecificComponent = Components[Component];
  useEffect(() => {
    SpecificComponent = Components[Component];
  }, [Component]);
  return (
    <div className="row">
      <div className="col-3">
        <div>
          <Head>
            <link
              rel="stylesheet"
              type="text/css"
              href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Roboto+Slab:400,700|Material+Icons"
            />
          </Head>
          <div
            className="sidebar"
            data-color="azure"
            data-background-color="white"
          >
            <div className="sidebar-wrapper">
              <ul className="nav nav-pills" style={{ marginTop: "50px" }}>
                <li
                  className="nav-item active"
                  onClick={() => {
                    setComponent("Information");
                  }}
                  data-bs-toggle="pill"
                >
                  <a className="nav-link" href="#">
                    <i className="material-icons">content_paste</i>
                    <p>Information</p>
                  </a>
                </li>
                <li
                  className="nav-item"
                  onClick={() => {
                    setComponent("Candidate");
                  }}
                  data-bs-toggle="pill"
                >
                  <a className="nav-link" href="#">
                    <i className="material-icons">group</i>
                    <p>Candidate Registration</p>
                  </a>
                </li>
                <li
                  className="nav-item"
                  onClick={() => {
                    setComponent("VoterReg");
                  }}
                  data-bs-toggle="pill"
                >
                  <a className="nav-link" href="#">
                    <i className="material-icons">person</i>
                    <p>Voter Registration</p>
                  </a>
                </li>
                {/* <li
                  className="nav-item"
                  onClick={() => {
                    setComponent("VoterLogin");
                  }}
                  data-bs-toggle="pill"
                >
                  <a className="nav-link" href="#">
                    <i className="material-icons">login</i>
                    <p>Voter Login</p>
                  </a>
                </li> */}
                <li
                  className="nav-item"
                  onClick={() => {
                    setComponent("Voting");
                  }}
                  data-bs-toggle="pill"
                >
                  <a className="nav-link" href="#">
                    <i className="material-icons">how_to_vote</i>
                    <p>Voting-Area</p>
                  </a>
                </li>
                <li
                  className="nav-item"
                  onClick={() => {
                    setComponent("Result");
                  }}
                  data-bs-toggle="pill"
                >
                  <a className="nav-link" href="#">
                    <i className="material-icons">assessment</i>
                    <p>Result</p>
                  </a>
                </li>
                {/* <li
                  className="nav-item"
                  data-bs-toggle="pill"
                  onClick={() => {
                    localStorage.setItem("LoggedIn", false);
                    window.location.reload();
                  }}
                >
                  <a className="nav-link" href="#">
                    <i className="material-icons">logout</i>
                    <p>LogOut</p>
                  </a>
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="col-9">
        <SpecificComponent />
      </div>
    </div>
  );
}
