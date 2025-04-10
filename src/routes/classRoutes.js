const express = require('express')
const router = express.Router()
const Class = require('../models/Class')
const User = require('../models/User')
const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  cancelarUsuarioClase,
  inscribirUsuarioClase
} = require('../controllers/classController')
const { protect, authorize } = require('../middlewares/authMiddleware')
const validateClassId = require('../middlewares/validateClassId')
const upload = require('../config/multer')

router.get('/', getClasses)
router.get('/:id', validateClassId, getClassById)
router.get('/me', protect, (req, res) => {
  res.status(200).json({ userId: req.user._id })
})

router.use(protect)

router.post(
  '/',
  authorize('monitor', 'admin'),
  upload.single('imagen'),
  createClass
)

router.put(
  '/:id',
  validateClassId,
  authorize('monitor', 'admin'),
  upload.single('imagen'),
  updateClass
)

router.delete(
  '/:id',
  validateClassId,
  authorize('monitor', 'admin'),
  deleteClass
)

router.post('/:id/inscribir', protect, async (req, res) => {
  try {
    let classItem = await Class.findById(req.params.id)
      .populate('inscritos', 'nombre email avatar rol')
      .populate('entrenador', 'nombre email avatar')

    if (!classItem) {
      return res
        .status(404)
        .json({ success: false, message: 'Clase no encontrada' })
    }

    if (classItem.inscritos.length >= classItem.capacidadMaxima) {
      return res
        .status(400)
        .json({ success: false, message: 'La clase está llena' })
    }

    const userId = req.user._id

    if (
      classItem.inscritos.some(
        (inscrito) => inscrito._id.toString() === userId.toString()
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Ya estás inscrito en esta clase' })
    }

    const user = await User.findById(userId).select('nombre email avatar rol')

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Usuario no encontrado' })
    }

    classItem.inscritos.push(userId)
    await classItem.save()

    classItem = await Class.findById(classItem._id)
      .populate('inscritos', 'nombre email avatar rol')
      .populate('entrenador', 'nombre email avatar')

    res.status(200).json({
      success: true,
      message: 'Inscripción exitosa',
      data: classItem
    })
  } catch (error) {
    console.error('Error en inscripción:', error)
    res.status(500).json({
      success: false,
      message: 'Error al inscribirse',
      error: error.message
    })
  }
})

router.post('/:id/cancelar', protect, async (req, res) => {
  try {
    let classItem = await Class.findById(req.params.id)
      .populate('inscritos', 'nombre email avatar rol')
      .populate('entrenador', 'nombre email avatar')

    if (!classItem) {
      return res
        .status(404)
        .json({ success: false, message: 'Clase no encontrada' })
    }

    const userId = req.user._id

    const inscritoIndex = classItem.inscritos.findIndex(
      (inscrito) => inscrito._id.toString() === userId.toString()
    )

    if (inscritoIndex === -1) {
      return res
        .status(400)
        .json({ success: false, message: 'No estás inscrito en esta clase' })
    }

    classItem.inscritos = classItem.inscritos.filter(
      (inscrito) => inscrito._id.toString() !== userId.toString()
    )

    await classItem.save()

    classItem = await Class.findById(classItem._id)
      .populate('inscritos', 'nombre email avatar rol')
      .populate('entrenador', 'nombre email avatar')

    res.status(200).json({
      success: true,
      message: 'Inscripción cancelada exitosamente',
      data: classItem
    })
  } catch (error) {
    console.error('Error al cancelar inscripción:', error)
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la inscripción',
      error: error.message
    })
  }
})

router.post('/:id/inscribir-usuario', protect, inscribirUsuarioClase)
router.post('/:id/cancelar-usuario', protect, cancelarUsuarioClase)

module.exports = router
