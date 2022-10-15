import JWTUtils from '../utils/jwt-utils';

function requiresAuth(tokenType) {
  return function(req, res, next) {
    const authHeader = req.headers.authorization;
    if(authHeader) {
      try {
        var [bearer, token] = authHeader.split(' ');
        if(bearer.toLowerCase() !== 'bearer' || !token) {
          throw Error;
        }  
      } catch (error) {
        res.status(401).send({ success: false, message: 'Bearer token malformed' });
      }
      
    } else {
      res.status(401).send({ success: false, message: 'Auth header not found' });
    }

    try {
      let jwt;
      switch(tokenType) {
        case 'refreshToken': 
          jwt = JWTUtils.verifyRefreshToken(token);
        break;
        case 'accessToken': 
        default:
          jwt = JWTUtils.verifyAccessToken(token);
      }
      req.body.jwt = jwt;
      next();
    } catch (error) {
      res.status(401).send({ success: false, message: 'Invalid Token' });
    }
  };
}

export default requiresAuth;