const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const secrets = require("./secrets.js");
const jwt = require("jsonwebtoken");

async function verify(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: secrets.OAUTH_AUDIENCE,
    });
    const payload = ticket.getPayload();
    if (payload.email != null && payload.email.includes("@pleasantonusd.net")) {
      return payload.email;
    } else return false;
  } catch (err) {
    return false;
  }
}

async function login(req, res, next) {
  try {
    const user = jwt.verify(req.cookies.auth, secrets.SECRET_CODE);
    if (user) {
      res.end("success");
      return true;
    }
  } catch (e) {
    const token = req.body.token;
    const emailOrVerificationFailed = await verify(token);
    if (emailOrVerificationFailed) {
      res.cookie("auth", generateToken({ emailOrVerificationFailed }));
      res.end("success");
    } else {
      res.end("failure");
    }
  }
}

function authorize(req, res, next) {
  try {
    const user = jwt.verify(req.cookies.auth, secrets.SECRET_CODE);
    req.user = user;
    req.authorized = true;
    next();
    return true;
  } catch (e) {
    req.authorized = false;
    next();
    return false;
  }
}

function redirectToLoginIfNotAuthorized(req, res, next) {
  if (!req.authorized) {
    res.redirect("/login");
  } else next();
}

function sendMessageIfNotAuthorized(message) {
  return (req, res, next) => {
    if (!req.authorized) {
      res.end(message);
    } else next();
  };
}

function generateToken(email) {
  return jwt.sign({ email }, secrets.SECRET_CODE, { expiresIn: "24h" });
}

exports.authorize = authorize;
exports.login = login;
exports.sendMessageIfNotAuthorized = sendMessageIfNotAuthorized;
exports.redirectToLoginIfNotAuthorized = redirectToLoginIfNotAuthorized;

