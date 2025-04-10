const mongoose = require('mongoose')

const ClassSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria']
    },
    horario: {
      type: String,
      required: [true, 'El horario es obligatorio']
    },
    duracion: {
      type: Number,
      required: [true, 'La duración es obligatoria']
    },
    capacidadMaxima: {
      type: Number,
      required: [true, 'La capacidad máxima es obligatoria']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: [
        'yoga',
        'pilates',
        'cardio',
        'fuerza',
        'crossfit',
        'hiit',
        'baile',
        'otro'
      ]
    },
    nivel: {
      type: String,
      required: [true, 'El nivel es obligatorio'],
      enum: ['principiante', 'intermedio', 'avanzado']
    },
    ubicacion: {
      type: String,
      required: [true, 'La ubicación es obligatoria']
    },
    diaSemana: {
      type: String,
      required: [true, 'El día de la semana es obligatorio'],
      enum: [
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
        'domingo'
      ]
    },
    fecha: {
      type: Date,
      default: null
    },
    esFechaEspecifica: {
      type: Boolean,
      default: false
    },
    imagen: {
      type: String
    },
    inscritos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    entrenador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true
  }
)

ClassSchema.pre('save', function (next) {
  const inscritosIds = this.inscritos.map((inscrito) => inscrito.toString())

  const uniqueIds = [...new Set(inscritosIds)]

  if (uniqueIds.length < inscritosIds.length) {
    this.inscritos = uniqueIds.map((id) => mongoose.Types.ObjectId(id))
  }

  next()
})

module.exports = mongoose.model('Class', ClassSchema)
