import { body, param, query, validationResult } from 'express-validator';

// Validation middleware to check for errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }
  next();
};

// Lead validation rules
export const createLeadValidation = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('Nombre is required')
    .isLength({ max: 100 }).withMessage('Nombre must be at most 100 characters'),
  body('apellidos')
    .trim()
    .notEmpty().withMessage('Apellidos is required')
    .isLength({ max: 100 }).withMessage('Apellidos must be at most 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('telefono')
    .optional()
    .trim()
    .matches(/^[+]?[0-9\s\-()]+$/).withMessage('Invalid phone format'),
  body('estado_actual')
    .optional()
    .isIn(['nuevo', 'contactado', 'en_seguimiento', 'calificado', 'propuesta_enviada', 'convertido', 'perdido'])
    .withMessage('Invalid status'),
  validate
];

export const updateLeadValidation = [
  param('id').isUUID().withMessage('Invalid lead ID'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Nombre must be at most 100 characters'),
  body('apellidos')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Apellidos must be at most 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('telefono')
    .optional()
    .trim()
    .matches(/^[+]?[0-9\s\-()]+$/).withMessage('Invalid phone format'),
  body('estado_actual')
    .optional()
    .isIn(['nuevo', 'contactado', 'en_seguimiento', 'calificado', 'propuesta_enviada', 'convertido', 'perdido'])
    .withMessage('Invalid status'),
  validate
];

export const getLeadByIdValidation = [
  param('id').isUUID().withMessage('Invalid lead ID'),
  validate
];

// Query parameter validation
export const queryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be a positive integer'),
  query('status')
    .optional()
    .isIn(['nuevo', 'contactado', 'en_seguimiento', 'calificado', 'propuesta_enviada', 'convertido', 'perdido'])
    .withMessage('Invalid status'),
  validate
];