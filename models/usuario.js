const moongose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = moongose.Schema;

const rolesValidos = {
    values: [ 'ADMIN_ROLE', 'USER_ROLE' ],
    message: '{VALUE} no es un rol permitido'
};


const usuarioSchema = new Schema({

    nombre: { type: String, required: [ true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [ true, 'El correo es necesario'] },
    password: { type: String, required: [ true, 'La contaseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }

});

usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe de ser único' } );

module.exports = moongose.model('Usuario', usuarioSchema);