const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Extraer token del header "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Guardamos los datos del usuario en la request
    next(); // Permite pasar al controlador
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Token inválido o expirado.' });
  }
};

module.exports = authenticate;