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

// --- TRUCO NINJA PARA LA DEMO: Memoria temporal para los códigos ---
const codigosRecuperacion = {};

// 1. Función para pedir el código
const solicitarCodigo = async (req, res, next) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
      return res.status(404).json({ message: "No existe cuenta con este correo." });
    }

    // Generamos un código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    codigosRecuperacion[email] = codigo; // Lo guardamos en la memoria del servidor

    // Para la evaluación, lo devolvemos en el JSON para mostrarlo en pantalla
    return res.json({ 
      message: "Código enviado", 
      codigoSimulado: codigo 
    });
  } catch (error) {
    next(error);
  }
};

// 2. Función para validar el código y cambiar la clave
const resetPassword = async (req, res, next) => {
  try {
    const { email, codigo, nuevaPassword } = req.body;

    // Comparamos el código que escribió el usuario con el que tenemos en memoria
    if (!codigosRecuperacion[email] || codigosRecuperacion[email] !== codigo) {
      return res.status(400).json({ message: "El código es incorrecto o ha expirado." });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    
    // Encriptamos y guardamos
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);
    
    await usuario.update({ password: hashedPassword });
    
    // Destruimos el código para que no se pueda reusar
    delete codigosRecuperacion[email];
    
    return res.json({ message: "Contraseña actualizada con éxito." });
  } catch (error) {
    next(error);
  }
};

// ¡Asegúrate de exportar ambas al final del archivo!
// module.exports = { login, register, solicitarCodigo, resetPassword };

module.exports = { login, register, resetPassword };