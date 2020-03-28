const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', ( req, res, next ) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // Tipos de colección
    let tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if ( tiposValidos.indexOf( tipo ) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es válida',
            errors: { message: 'Tipo de coleccion no es válida' }
        });

    }

    if ( !req.files ) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });

    }

    // Obtener el nombre del archivo
    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extensionArchivo = nombreCortado[ nombreCortado.length -1 ];

    // Solo estas extensiones aceptamos
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf( extensionArchivo ) < 0 ) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: `Las extensiones válidas son: ${ extensionesValidas.join(', ') }` }
        });

    }

    // Nombre de archivo personalizado
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    let path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err => {
        
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });

    });


});

function subirPorTipo( tipo, id, nombreArchivo, res ) {

    if ( tipo === 'usuarios' ) {

        Usuario.findById( id, ( err, usuario ) => {

            if ( !usuario ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe'}
                });
            }

            let pathViejo = `./uploads/usuarios/${ usuario.img }`;

            // Si existe, elimina la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlinkSync( pathViejo );
            }

            usuario.img = nombreArchivo;

            usuario.save( ( err, usuarioActualizado ) => {

                usuarioActualizado.password = ':)';
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });

        });

    }

    if ( tipo === 'medicos' ) {

        Medico.findById( id, ( err, medico ) => {

            if ( !medico ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe'}
                });
            }

            let pathViejo = `./uploads/medicos/${ medico.img }`;

            // Si existe, elimina la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlinkSync( pathViejo );
            }

            medico.img = nombreArchivo;

            medico.save( ( err, medicoActualizado ) => {
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });

            });

        });

    }

    if ( tipo === 'hospitales' ) {

        Hospital.findById( id, ( err, hospital ) => {

            if ( !hospital ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe'}
                });
            }

            let pathViejo = `./uploads/hospitales/${ hospital.img }`;

            // Si existe, elimina la imagen anterior
            if ( fs.existsSync(pathViejo) ) {
                fs.unlinkSync( pathViejo );
            }

            hospital.img = nombreArchivo;

            hospital.save( ( err, hospitalActualizado ) => {
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });

            });

        });

    }
    
}

module.exports = app;