const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
async function verify(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "559805050687-jg9mfqa2mq2qnu4kcjt32lqe661uqacg.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    if (payload.email != null && payload.email.includes("@pleasantonusd.net")) {
      return true;
    } else return false;
  } catch (err) {
    // console.log(err);
    return false;
  }
}

async function authorize(req) {
  const token = req?.body?.token;
  if (token != null) {
    const result = await verify(token);
    //console.log(result);
    if (result) {
      req.session.authorized = true;
      req.session.save();
      return true;
    } else {
      req.session.authorized = false;
      req.session.save();
      return false;
    }
  }
  return false;
}

module.exports = authorize;
