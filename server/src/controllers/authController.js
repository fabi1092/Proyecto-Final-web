const { Usuario } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: true, message: 'Contraseña mínima de 6 caracteres.' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ error: true, message: 'El correo ya está registrado.' });
    }

    const nuevoUsuario = await Usuario.create({ nombre, email, password });
    return res.status(201).json({ error: false, message: 'Usuario registrado con éxito.' });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Error en el servidor.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: true, message: 'Credenciales inválidas.' });
    }

    const passValida = await bcrypt.compare(password, usuario.password);
    if (!passValida) {
      return res.status(401).json({ error: true, message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      error: false,
      message: 'Login exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre }
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Error en el servidor.' });
  }
};

module.exports = { register, login };