import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires?: Date | null;

  emailVerificationToken: string;
  emailVerified: boolean;
  facebook: string;
  google: string;
  twitter: string;
  tokens: AuthToken[];

  profile: {
    name: string;
    gender: string;
    location: string;
    website: string;
    picture: string;
  };
}


export interface UserDocument extends IUser, Document {
  comparePassword: (candidatePassword: string, cb: (err: any, isMatch: boolean) => void) => void;
}

export interface AuthToken {
  accessToken: string;
  kind: string;
}

const userSchema = new Schema<UserDocument>(
  {
    facebook: String,
    twitter: String,
    google: String,
    tokens: Array,
    email: { type: String, required: true },
    password: { type: String, required: true },
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerified: Boolean,

    profile: {
      name: String,
      gender: String,
      location: String,
      website: String,
      picture: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.gravatar = function (size = 200) {
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash("md5").update(this.email).digest("hex");
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

userSchema.methods.comparePassword = function (candidatePassword: string, cb: (err: any, isMatch: boolean) => void) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};


 const User = mongoose.model<UserDocument>("User", userSchema);
export default User;
