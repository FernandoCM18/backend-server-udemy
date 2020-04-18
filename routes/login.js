const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;
const app = express();
const Usuario = require('../models/usuario');

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID); 

const mdAutenticacion = require('../middlewares/autenticacion');

// ==============================================================
// 
// ==============================================================
app.get('/renuevatoken', mdAutenticacion.verficaToken, ( req, res ) => {

    let token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // 4 horas


    return res.status(200).json({
        ok: true,
        tokne: token
    });

});

// ==============================================================
// Login Google
// ==============================================================
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture, 
        google: true
    }
}

app.post('/google', async( req, res ) => {

    let token = req.body.token;

    let googleUser = await verify( token )
        .catch( err => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido',
                errors: err
            });
        });

        Usuario.findOne( { email: googleUser.email }, ( err, usuarioDB ) => {

            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuarios',
                    errors: err
                });
            }

            if ( usuarioDB ) {

                if ( usuarioDB.google === false ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe de usar su autenticación normal'
                    });
                } else {

                    let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id,
                        menu: obtenerMenu( usuarioDB.role )
                    });
                }
            } else {
                // El usuario no exite... hay que crearlo
                let usuario = new Usuario();

                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true.google;
                usuario.password = ':)';

                usuario.save( ( err, usuarioDB ) => {
                    let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id,
                        menu: obtenerMenu( usuario.role )
                    });

                });
            }

        });

        // return res.status(200).json({
        //     ok: true,
        //     mensaje: 'OK!!',
        //     googleUser: googleUser
        // });

});

// ==============================================================
// Login normal
// ==============================================================
app.post('/', ( req, res ) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, ( err, usuarioDB ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if ( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token
        usuarioDB.password = ':)';
        let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas


        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu( usuarioDB.role )
        });

    });

});

function obtenerMenu( ROLE ) {

    let menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'ProgresssBar', url: '/progress' },
            { titulo: 'Gráficas', url: '/graficas1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'RxJs', url: '/rxjs' }
          ]
        },
        {
          titulo: 'Mantenimiento',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url: '/usuarios' },
            { titulo: 'Hospitales', url: '/hospitales' },
            { titulo: 'Médicos', url: '/medicos' }
          ]
        }
      ];

      if ( ROLE === 'ADMIN_ROLE' ) {
        menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios' } );
      }


    return menu;
}


module.exports = app;