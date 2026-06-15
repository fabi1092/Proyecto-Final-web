const { Usuario } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- 1. REGISTRO DE USUARIO ---
const register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "Este correo ya está registrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await Usuario.create({ nombre, email, password: hashedPassword });
    return res.status(201).json({ message: "Usuario creado exitosamente" });

  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Datos inválidos o correo ya registrado." });
    }
    next(error);
  }
};

// --- 2. LOGIN DE USUARIO ---
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Generamos el Token con el ID y el Email (necesario para tu panel de Admin)
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email }, 
      process.env.JWT_SECRET || 'secreto_super_seguro', 
      { expiresIn: '24h' }
    );

    return res.json({ token, message: "Login exitoso" });
  } catch (error) {
    next(error);
  }
};

// --- 3. SOLICITAR CÓDIGO (RECUPERACIÓN) ---
const codigosRecuperacion = {};

const solicitarCodigo = async (req, res, next) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
      return res.status(404).json({ message: "No existe cuenta con este correo." });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    codigosRecuperacion[email] = codigo; 

    return res.json({ 
      message: "Código enviado", 
      codigoSimulado: codigo 
    });
  } catch (error) {
    next(error);
  }
};

// --- 4. RESETEAR CONTRASEÑA ---
const resetPassword = async (req, res, next) => {
  try {
    const { email, codigo, nuevaPassword } = req.body;

    if (!codigosRecuperacion[email] || codigosRecuperacion[email] !== codigo) {
      return res.status(400).json({ message: "El código es incorrecto o ha expirado." });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);
    
    await usuario.update({ password: hashedPassword });
    delete codigosRecuperacion[email];
    
    return res.json({ message: "Contraseña actualizada con éxito." });
  } catch (error) {
    next(error);
  }
};

// --- EXPORTACIÓN FINAL (Aquí estaba el error) ---
module.exports = { 
  register, 
  login, 
  solicitarCodigo, 
  resetPassword 
};