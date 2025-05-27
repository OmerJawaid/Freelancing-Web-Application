import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.access_token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You are not authenticated"
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Token is not valid"
    });
  }
}; 