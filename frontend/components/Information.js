export default function Information() {
  return (
    <div className="content" style={{ marginTop: "15px !important" }}>
      <div className="container" style={{ width: "900px" }}>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header card-header-info">
                <h4 className="card-title">User Manual</h4>
              </div>
              <div className="card-body">
                <h4>Welcome </h4>
                <h5>These are few Guidelines for user : </h5>
                <h5>1. Voter Registration</h5>

                <ul>
                  <li>
                    For casting the vote user needs to first register
                    himself/herself. For this registration purpose , the user
                    will be provided a voter registration form on this website.
                  </li>
                  <li>
                    The voter can only register in the registration phase. After
                    the registration phase is over the user can not register and
                    thus will not be able to vote.
                  </li>
                  <li>
                    For registration , the user will have to enter his/her name,
                    account address and photo of the user which the user will be
                    using for voting purpose.
                  </li>
                  <li>
                    The second stage is OTP verification. This stage is required
                    to validate the voter itself.
                  </li>
                  <li>
                    After entering correct OTP user will get successfully
                    registered.
                  </li>
                </ul>

                <h5>2.Voting Process</h5>
                <ul>
                  <li>
                    Overall , voting process is divided into three phases. All
                    of which will be initialized and terminated by the admin.
                    User have to participate in the process according to current
                    phase.
                  </li>
                </ul>
                <ol>
                  <li>
                    <strong>Registration Phase</strong>: During this phase the
                    registration of the users (which are going to cast the vote)
                    will be carried out.{" "}
                  </li>
                  <li>
                    <strong>Voting Phase</strong>: After initialization of
                    voting phase from the admin, user can cast the vote in
                    voting section.The casting of vote can be simply done by
                    clicking on “VOTE” button, after which transaction will be
                    initiated and after confirming transaction the vote will get
                    successfully casted. After voting phase gets over user will
                    not be able to cast vote.
                  </li>
                  <li>
                    <strong> Result Phase</strong>: This is the final stage of
                    whole voting process during which the results of election
                    will be displayed at “Result” section.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
