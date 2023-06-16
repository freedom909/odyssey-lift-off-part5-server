import { timeout } from 'async';
import { User } from '../../src/models/User'
import { expect } from 'chai';
import { Callback } from 'mongoose';

import * as sinon from 'sinon'


describe('User Model', () => {
  let sandbox: sinon.SinonSandbox
  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })
  afterEach(() => {
    sandbox.restore();
  })
  it('should be able to create a new user', async () => {
  timeout: 10000
    const user = new User({
      email: 'test@gmail.com',
      password: 'test'
    });
    try {
      await user.save();
    } catch (err) {
    expect(user.email).to.equal('test@gmail.com');
    expect(user.password).to.equal('test');
    expect(user._id).to.exist;
    expect(user._id).to.be.a('string');
    expect(user._id).to.not.equal('');
    expect(user._id).to.not.equal(null);
    expect(user._id).to.not.equal(undefined);
    expect(user._id).to.not.equal(NaN);
    expect(user._id).to.not.equal(Infinity); 
  }
})

  it('should not be able to create a new user with an invalid email', async () => {
    const user = new User({
      email: '',
      password: 'test'
    })
    try {
    await user.save()
  }catch(err) {
      expect(err).to.exist
      expect(err).to.be.an.instanceOf(Error)
      expect(err.message).to.equal('Invalid email address')
      return
    }
    })
  
    it('should return error if user is not created', function(done) {
      this.timeout(10000)
      const user = new User({
        email: '',
        password: 'test'
      })
      user.save().catch((err: { message: any; }) => {
        expect(err).to.exist
        expect(err).to.be.an.instanceOf(Error)
        expect(err.message).to.equal('Invalid username')
        done()
        return
      })
    })

    it('should not create a user with the unique email', done => {
      const user = new User({
        email: 'test@gmail.com',
        password: 'test'
      })

      user.save().catch((err: { message: any; }) => {
        expect(err).to.exist
        expect(err).to.be.an.instanceOf(Error)
        expect(err.message).to.equal('Email already exists')
        done()
        return
      })
    })
  })
  
  it('should not be able to create a new user with an invalid password', async () => {
    const user = new User({
      email: 'test@gmail.com',
      password: ''
    }) 
    try {
    await user.save()}
    catch(err){
      expect(err).to.exist
      expect(err).to.be.an.instanceOf(Error)
      expect(err.message).to.equal("Invalid email address.")
    }
  })

    it('should return error if user is not created', async ()=> {
     timeout:10000
      const user = new User({
        email: 'aff@gmail.com',
        password: ''
      })
      try {user.save()
      }
        
      catch(err) { 
        expect(err).to.exist
        expect(err).to.be.an.instanceOf(Error)
        expect(err.message).to.equal('password is not valid')
       
        return "password is not valid"
      }
    })
   
  


  it('should be able to find a user by email', async () => {
    const user = new User({
      email: 'test@gmail.com',
      
    })
    try{await user.save()}
    catch(err){
    const foundUser = await User.findOne({ email: 'test@gmail.com' })
    expect(foundUser).to.exist
    expect(foundUser?.email).to.equal('test@gmail.com')
    expect(foundUser?.password).to.equal('test') // Update the password expectation
    expect(foundUser?._id).to.exist
    expect(foundUser?._id).to.be.a('string')
    expect(foundUser?._id).to.not.equal('')
    expect(foundUser?._id).to.not.equal(null)
    expect(foundUser?._id).to.not.equal(undefined)
    expect(foundUser?._id).to.not.equal(NaN)
    expect(foundUser?._id).to.not.equal(Infinity)
    expect(foundUser?.profile).to.exist
    expect(foundUser?.profile?.name).to.exist
    expect(foundUser?.profile?.gender).to.exist
    expect(foundUser?.profile?.location).to.exist
    expect(foundUser?.profile?.website).to.exist
    // expect(foundUser?.profile?.picture).to.exist // Update or remove this expectation
    expect(foundUser?.tokens).to.exist
    expect(foundUser?.tokens?.length).to.equal(0)
    expect(foundUser?.emailVerified).to.exist
    expect(foundUser?.emailVerified).to.equal(false)
    expect(foundUser?.google).to.exist
    expect(foundUser?.facebook).to.exist
    expect(foundUser?.twitter).to.exist
    expect(foundUser?.emailVerificationToken).to.exist
    expect(foundUser?.emailVerificationToken).to.equal('')
    expect(foundUser?.passwordResetToken).to.exist
    expect(foundUser?.passwordResetToken).to.equal('')
    expect(foundUser?.passwordResetExpires).to.exist
    expect(foundUser?.passwordResetExpires).to.equal(null)
    expect(foundUser?.emailVerified).to.exist
    expect(foundUser?.facebook).to.equal('')
    expect(foundUser?.google).to.equal('')
    expect(foundUser?.twitter).to.equal('')
  }
})

  


it('should remove user by email', done => {
  const user = new User({
    email: 'test@gmail.com',
    password: 'test'
  })
  user.save().then(() => {
    User.findOneAndRemove({ email: 'test@gmail.com' }).then((email: any ) => {
      expect(user).to.exist
      expect(user?.email).to.equal('test@gmail.com')
    })
    User.findOne({ email: 'test@gmail.com' }).then((user: any) => {
      expect(user).to.not.exist
      done()
    })
  })

    


  


// it('should check password', done => {
//   const user = new User({
//     email: 'test@gmail.com',
//     password: 'test'
//   })
//   user.save().then(() => {
//     User.findOne({ email: 'test@gmail.com' }).then((user: { password: any; }) => {
//       expect(user).to.exist
//       expect(user?.password).to.equal('test')
//       done()
//     })
//   })
// })

it('should generate gravatar without email and size', () => {
  const user = new User({
    email: 'test@gmail.com',
    password: 'test'
  })
  try {
  user.save()
   const findUser= User.findOne({ email: 'test@gmail.com' })
  }
catch (err) {
    ((findUser: { profile: { picture: any; }; }) => {
      expect(user).to.exist
      expect(user?.profile?.picture).to.exist
    })
  }
})
})

