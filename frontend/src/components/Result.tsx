import { useChainId, useContract, useContractRead } from "@thirdweb-dev/react";
import { CONTRACT_ADDRESS } from "../constants";
import { Candidate } from "../types";

export default function Result() {
  const { contract } = useContract(CONTRACT_ADDRESS);
  const { data: candidates, isLoading: candidatesLoading } = useContractRead(contract, "getCandidates");
  const { data: winners, isLoading: winnersLoading } = useContractRead(contract, "getWinners");
  const { data: numberOfWinners } = useContractRead(contract, "numberOfWinners");

  return (
    <div className="content">
      <div className="container" style={{ width: "900px" }}>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header card-header-info">
                <h4 className="card-title">Result</h4>
              </div>
              <div>
                {numberOfWinners && numberOfWinners > 1 ? (
                  <div className="h2 text-center p-2">It's a draw</div>
                ) : (
                  ""
                )}
              </div>
              <div className="card-body">
                {winners && winners.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Votes</th>
                      </tr>
                    </thead>
                    <tbody id="Results">
                      {winners.map((winner: Candidate, index: number) => {
                        return (
                          <tr key={index}>
                            <th scope="col">{winner.id.toString()}</th>
                            <th scope="col">{winner.name}</th>
                            <th scope="col">{winner.voteCount.toString()}</th>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div id="not">
                    {winnersLoading ? <div>Loading...</div> :
                      <h3>Election is Not Over Yet!</h3>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header card-header-info">
                <h4 className="card-title">Candidates</h4>
              </div>
              <div className="card-body">
                {candidates && candidates.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Votes</th>
                      </tr>
                    </thead>
                    <tbody id="Results">
                      {candidates.map((candidate: Candidate, index: number) => {
                        return (
                          <tr key={index}>
                            <th scope="col">{candidate.id.toString()}</th>
                            <th scope="col">{candidate.name}</th>
                            <th scope="col">
                              {candidate.voteCount.toString()}
                            </th>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div id="not">
                    {candidatesLoading ? <div>Loading...</div> :
                      <h3>No Candidates Have Registered Yet!</h3>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
