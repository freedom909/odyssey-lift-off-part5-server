// import { expect } from "chai";
// import { Request, Response } from "express";
// import passport from "passport";
// import sinon, { SinonStub } from "sinon";
// import { configurePassportSession,configurePassport,isAuthenticated,isAuthorized,getGoogle,googleSignIn,signOut,oauthCallback } from "../../src/config/google.passport";

// describe("Authentication Middleware", () => {
//   let req: Request;
//   let res: Response;
//   let next: sinon.SinonSpy;

//   beforeEach(() => {
//     req = {} as Request;
//     res = {} as Response;
//     next = sinon.spy();
//   });

//   afterEach(() => {
//     sinon.restore();
//   });

//   it("should call passport.authenticate with correct options", () => {
//     const authenticateStub: SinonStub = sinon.stub(passport, "authenticate").returns(() => {});
//     authenticate(req, res, next);
//     expect(authenticateStub.calledOnce).to.be.true;
//     expect(authenticateStub.getCall(0).args[0]).to.equal("local");
//     expect(authenticateStub.getCall(0).args[1]).to.deep.equal({
//       successRedirect: "/success",
//       failureRedirect: "/failure",
//       failureFlash: true,
//     });
//   });

//   it("should call passport.authenticate and redirect to success URL when authentication succeeds", () => {
//     const authenticateStub: SinonStub = sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
//       callback(null, { success: true });
//     });
//     req.query = { returnTo: "/return-url" };
//     res.redirect = sinon.spy();
//     authenticate(req, res, next);
//     expect(authenticateStub.calledOnce).to.be.true;
//     expect(res.redirect.calledOnce).to.be.true;
//     expect(res.redirect.getCall(0).args[0]).to.equal("/success");
//   });

//   it("should call passport.authenticate and redirect to failure URL when authentication fails", () => {
//     const authenticateStub: SinonStub = sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
//       callback(null, false);
//     });
//     req.query = { returnTo: "/return-url" };
//     res.redirect = sinon.spy();
//     authenticate(req, res, next);
//     expect(authenticateStub.calledOnce).to.be.true;
//     expect(res.redirect.calledOnce).to.be.true;
//     expect(res.redirect.getCall(0).args[0]).to.equal("/failure");
//   });

//   it("should call next middleware when an error occurs during authentication", () => {
//     const authenticateStub: SinonStub = sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
//       callback(new Error("Authentication error"));
//     });
//     authenticate(req, res, next);
//     expect(authenticateStub.calledOnce).to.be.true;
//     expect(next.calledOnce).to.be.true;
//     expect(next.getCall(0).args[0]).to.be.an.instanceOf(Error);
//     expect(next.getCall(0).args[0].message).to.equal("Authentication error");
//   });
// });
