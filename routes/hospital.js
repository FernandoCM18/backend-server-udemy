const express = require('express');

const mdAutenticacion = require('../middlewares/autenticacion');

const app = express();

const Hospital = require('../models/hospital');

// ==============================================================
// Obtener todos los hospitales.
// ==============================================================
app.get('/', ( req, res, next ) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec( ( err, hospitales ) => {

            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.countDocuments({}, ( err, conteo ) => {

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });

            });
    
    
        });

});

// ==========================================
//  Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {

    let id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                }); 
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false, 
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            
            res.status(200).json({
                ok: true,
                hospital: hospital
            }); 
        });
});


// ==============================================================
// Crear un nuevo hospital.
// ==============================================================
app.post('/', mdAutenticacion.verficaToken, ( req, res ) => {

    let body = req.body;

    let hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( ( err, hospitalGuardado ) => {

        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});

// ==============================================================
// Actualizar hospital.
// ==============================================================
app.put('/:id', mdAutenticacion.verficaToken, ( req, res ) => {

    let id = req.params.id;
    let body = req.body;

    Hospital.findById( id, ( err, hospital ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if ( !hospital ) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${ id } no existe`,
                errors: { message: 'No existe un hospital con ese ID'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( ( err, hospitalGuardado ) => {

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});

// ==============================================================
// Borrar un hospital por el id
// ==============================================================
app.delete('/:id', mdAutenticacion.verficaToken, ( req, res ) => {
    
    let id = req.params.id;

    Hospital.findByIdAndRemove( id, ( err, hospitalBorrado ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if ( !hospitalBorrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    })

});



module.exports = app;