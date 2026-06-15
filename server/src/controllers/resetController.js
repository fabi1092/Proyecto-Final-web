const { Usuario, ResetToken } = require('../models');
const bcrypt = require('bcrypt'); // Asegúrate de que usas 'bcrypt' o 'bcryptjs' según tu proyecto

const solicitarReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: true, message: 'El correo es obligatorio' });

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(404).json({ error: true, message: 'Usuario no encontrado' });

    // [GEN-07] Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 15); // [GEN-07] Expira en 15 minutos

    await ResetToken.create({ token: codigo, email, expiracion });

    // [GEN-07] Simulación de envío (modo desarrollo)
    console.log('\n======================================================');
    console.log(`📧 SIMULADOR DE EMAIL: Se solicitó recuperar contraseña`);
    console.log(`👤 Para: ${email}`);
    console.log(`🔑 CÓDIGO DE RECUPERACIÓN: ${codigo}`);
    console.log('======================================================\n');

    return res.json({ error: false, message: 'Se ha enviado un código de recuperación a tu correo.' });
  } catch (error) {
    next(error);
  }
};

const confirmarReset = async (req, res, next) => {
  try {
    const { email, token, nuevaPassword } = req.body;

    if (!email || !token || !nuevaPassword) {
      return res.status(400).json({ error: true, message: 'Todos los campos son obligatorios' });
    }

    // [GEN-07] Buscar token válido y no expirado
    const tokenValido = await ResetToken.findOne({
      where: { email, token, usado: false }
    });

    if (!tokenValido) {
      return res.status(400).json({ error: true, message: 'Código inválido o ya utilizado' });
    }

    if (new Date() > tokenValido.expiracion) {
      return res.status(400).json({ error: true, message: 'El código ha expirado' });
    }

    // [GEN-07] Actualizar contraseña encriptada
    const usuario = await Usuario.findOne({ where: { email } });
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(nuevaPassword, salt);
    await usuario.save();

    // Marcar token como usado para que no se recicle
    tokenValido.usado = true;
    await tokenValido.save();

    return res.json({ error: false, message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { solicitarReset, confirmarReset };