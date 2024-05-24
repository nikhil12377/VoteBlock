import { useEffect, useState } from "react";
import { MdAssessment, MdContentPaste, MdGroup, MdHowToVote, MdPerson } from "react-icons/md";
import Information from "../components/Information";
import Candidate from "../components/Candidate";
import VoterReg from "../components/VoterReg";
import Voting from "../components/Voting";
import Result from "../components/Result";
export default function Admin() {
    const [Component, setComponent] = useState<string>("Information");

    const Components: Record<string, React.FC> = {
        Information: Information,
        Candidate: Candidate,
        VoterReg: VoterReg,
        Voting: Voting,
        Result: Result,
    };

    let SpecificComponent: React.FC = Components[Component];

    useEffect(() => {
        SpecificComponent = Components[Component];
    }, [Component]);
    return (
        <div className="row">
            <div className="col-3">
                <div>
                    {/* <Head>
                        <link
                            rel="stylesheet"
                            type="text/css"
                            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Roboto+Slab:400,700|Material+Icons"
                        />
                    </Head> */}
                    <div
                        className="sidebar"
                        data-color="azure"
                        data-background-color="white"
                    >
                        <div className="sidebar-wrapper">
                            <ul className="nav nav-pills" style={{ marginTop: "50px" }}>
                                <li
                                    className="nav-item active text-lg"
                                    onClick={() => {
                                        setComponent("Information");
                                    }}
                                    data-bs-toggle="pill"
                                >
                                    <a className="nav-link" href="#">
                                        <MdContentPaste size="20px" />
                                        <span className="sidenav_heading"> Information</span>
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
                                        <MdGroup size="20px" />
                                        <span className="sidenav_heading"> Candidate Registration</span>
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
                                        <MdPerson size="20px" />
                                        <span className="sidenav_heading"> Voter Registration</span>
                                    </a>
                                </li>
                                <li
                                    className="nav-item"
                                    onClick={() => {
                                        setComponent("Voting");
                                    }}
                                    data-bs-toggle="pill"
                                >
                                    <a className="nav-link" href="#">
                                        <MdHowToVote size="20px" />
                                        <span className="sidenav_heading"> Voting-Area</span>
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
                                        <MdAssessment size="20px" />
                                        <span className="sidenav_heading"> Result</span>
                                    </a>
                                </li>
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