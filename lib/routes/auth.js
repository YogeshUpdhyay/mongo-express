import { Issuer, generators } from 'openid-client';
import axios from 'axios';

const redirectUri = '/oauth/callback';
const responseType = 'code';

export default async function (config) {
  const funcs = {};
  const openIdIssuer = await Issuer.discover(config.oauthAuth.issuer);
  const client = new openIdIssuer.Client({
    client_id: config.oauthAuth.clientId,
    client_secret: config.oauthAuth.clientSecret,
    redirect_uris: [redirectUri],
    response_type: [responseType],
  });
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);

  async function getAuthorizeUrl(protocol, host) {
    return client.authorizationUrl({
      scope: 'openid email profile',
      redirect_uri: [`${protocol}://${host}${redirectUri}`],
      code_challenge: codeChallenge,
      code_verifier: codeVerifier,
    });
  }

  funcs.authorizationMiddleware = async function (req, res, next) {
    const { token } = req.cookie;
    if (token) {
      const introspectData = await client.introspect(token);
      console.log(introspectData);
      next();
    }
    res.redirect('/login');
  };

  funcs.authorizedCallback = async function (req, res)  {
    const params = client.callbackParams(req);
    const reqConfig = {
      method: 'post',
      url: openIdIssuer.metadata.token_endpoint,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: JSON.stringify({
        code: params.code,
        grant_type: 'authorization_code',
        redirect_uri: `${req.protocol}://${req.headers.host}${redirectUri}`,
        client_id: config.oauthAuth.clientId,
        client_secret: config.oauthAuth.clientSecret,
      }),
    };
    const tokenResponse = await axios(reqConfig);
    console.log(tokenResponse.data);
    res.redirect('/');
  };

  funcs.loginController = async function (req, res) {
    const ctx = {};
    ctx.authUrl = await getAuthorizeUrl(req.protocol, req.headers.host);
    res.render('login', ctx);
  };

  return funcs;
}
