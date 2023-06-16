import { Document } from "mongoose";

interface UserDocument extends Document {
  email: string;
  password: string;
  comparePassword: jest.Mock<any, any>;
  passwordResetToken: string;
  emailVerificationToken: string;
  emailVerified: boolean;
  facebook: string;
  google: string;
  twitter: string;
  tokens: string[];

  profile: {
    name: string;
    gender: string;
    location: string;
    website: string;
    picture: string;
  };
  $isDefault: jest.Mock<any, any>;
  $isDeleted: jest.Mock<any, any>;
  $getPopulatedDocs: jest.Mock<any, any>;
  $inc: jest.Mock<any, any>;
  $assertPopulated: jest.Mock<any, any>;
  $set: jest.Mock<any, any>;
  $unset: jest.Mock<any, any>;
  $setOnInsert: jest.Mock<any, any>;
  $setOnInsertMany: jest.Mock<any, any>;
  $setOnUpdate: jest.Mock<any, any>;
  $setOnUpdateMany: jest.Mock<any, any>;
}

export default UserDocument;
