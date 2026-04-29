const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  idContenido: { type: mongoose.Schema.Types.ObjectId, required: true },
  reportadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  motivo: { type: String, required: true },
  resuelto: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
