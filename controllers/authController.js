const User = require('../models/UserModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const registerUser = async(req, res, next) => {
 
    const {nombre, apellido, contraseña, correo, telefono} = req.body

    if(JSON.stringify(req.body) == '{}') return res.status(400).json({ error: 'Ingresa tus datos!' })

    if(!(nombre && correo && contraseña && telefono)) return res.status(400).json({ error: 'Ingresa los datos necesarios!' })

    const userExist = await User.findOne({correo: correo})

    if(userExist) return res.status(406).json({ error: 'usuario ya registrado' })

    try {
        const encryptedPassword = await bcrypt.hash(contraseña, 10)
        const token = jwt.sign({ correo: correo }, process.env.JWT_KEY)
        const newUser = new User({
            nombre: nombre,
            apellido: apellido,
            contraseña: encryptedPassword,
            correo: correo,
            telefono: telefono,
            rol: 'usuario',
            token: token,
            creditos: 300
        })
        await newUser.save()
        return res.status(201).json({response: 'usuario registrado!'}) //en el front hacer un redirect a login
    } catch (error) {
        next(error)
    }
}

const loginUser = async(req, res, next) => {
    const { correo, contraseña } = req.body

    if(JSON.stringify(req.body) == '{}') return res.status(200).json({error: 'ingresa tus datos!'})

    if(!(correo && contraseña)) return res.status(400).json({error: 'ingresa todos los datos!'})

    try {
        const matchUser = await User.findOne({correo: correo}).select('contraseña nombre apellido correo creditos rol token') 
        if(!matchUser) return res.status(400).json({ error: 'usuario no registrado.' })

        const decrypt = await bcrypt.compare(contraseña, matchUser.contraseña)

        if(decrypt) return res.status(200).json(matchUser)
        return res.status(401).json({ error: 'contraseña invalida' })
      
    } catch (error) {
        next(error)
    }

}


module.exports = { registerUser, loginUser }