const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    // customer | admin
    level: { type: String, default: "customer" },
  },
  { timestamps: true }
);
// userSchema의 데이터를 JSON으로 만들기 전에 delete 속성들을 빼고 obj로 리턴하겠다.
userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  delete obj.updatedAt;
  delete obj.createdAt;

  return obj;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
