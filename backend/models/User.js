const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    totpSecret: {
      type: String,
    },
    totpVerified: {
      type: Boolean,
      default: false,
    },
    recoveryCodes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password before saving
// NOTE: In Mongoose 8.x, async pre-hooks must NOT use a `next` callback.
// The middleware chain is driven by the returned promise instead.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
