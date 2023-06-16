import passport from "passport";
import { Strategy as LocalStrategy, IVerifyOptions } from "passport-local";
import { User, UserDocument } from "../../src/models/User";

describe("Local Passport Configuration", () => {
  let User: any;

  beforeAll(() => {
    // Mock the User model

  
    User = {
      
      findOne: jest.fn()
    };

    // Configure Passport to use the LocalStrategy

    passport.use(
      new LocalStrategy(
        { usernameField: "email" },
        async (email, password, done) => {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Incorrect email." });
          }
          const isMatch = user.comparePassword(password, (err: any, isMatch: boolean) => {
            if (err) {
              return done(err);
            }
            if (!isMatch) {
              return done(null, false, { message: "Incorrect password." });
            }
            return done(null, user);
          });
        }
      )
    );
  });

  afterAll(() => {
    // Reset the mocked Passport configuration

    jest.restoreAllMocks(); // Use jest.restoreAllMocks() instead of jest.resetAllMocks() to restore all mocked functions
    passport.unuse("local");
  });

  it("should authenticate a user with valid credentials", (done) => {
    // Mock the User.findOne method to return a user
    User.findOne.mockResolvedValue({
      email: "test@example.com",
      comparePassword: jest.fn()
    });

    // Call the authenticate middleware with mock data
    const authenticateMiddleware = passport.authenticate("local", (err, user, info) => {
      // Assertions
      expect(err).toBeNull();
      expect(user).toBeDefined();
      expect(info).toBeUndefined();

      done();
    });

    authenticateMiddleware({ body: { email: "test@example.com", password: "password" } });
  });
});

