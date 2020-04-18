const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

// ==============================================================
// Verificar token
// ==============================================================
exports.verficaToken = function( req, res, next ) {

    let token = req.query.token;

    jwt.verify( token, SEED, ( err, decoded ) => {

        if ( err ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;
        next();

    });

}

// ==============================================================
// Verificar ADMIN
// ==============================================================
exports.verficaADMIN_ROLE = function( req, res, next ) {

    let usuario = req.usuario;

    if ( usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });
    }

}

// ==============================================================
// Verificar ADMIN o Mismo usuario
// ==============================================================
exports.verficaADMIN_o_MismoUsuario = function( req, res, next ) {

    let usuario = req.usuario;
    let id = req.params.id;

    if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });
    }

}
