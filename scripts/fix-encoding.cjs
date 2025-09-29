const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'README.md',
  path.join('src','pages','Leads.tsx'),
  path.join('src','pages','Workflows.tsx'),
];

const replacements = [
  // Reemplazos amplios para palabras comunes con mojibake variable
  [/Informaci.{0,3}n/g, 'Información'],
  [/Gesti.{0,3}n/g, 'Gestión'],
  [/automatizaci.{0,3}n/g, 'automatización'],
  [/estad.{0,3}sticas/g, 'estadísticas'],
  [/configuraci.{0,3}n/g, 'configuración'],
  [/descripci.{0,3}n/g, 'descripción'],
  [/creaci.{0,3}n/g, 'creación'],
  [/Campa.{0,3}a/g, 'Campaña'],
  [/pesta.{0,3}a/g, 'pestaña'],
  // Variantes de "Último/Última"
  [/[^A-Za-z]ltimo contacto/g, ' Último contacto'],
  [/s?ltimo contacto/g, 'Último contacto'],
  [/[^A-Za-z]ltima/g, ' Última'],
  [/s?ltima/g, 'Última'],
  // Casos específicos en TSX
  [/Presupuesto:\s*\{intento\.presupuesto_min\}\?\s*-\s*\{intento\.presupuesto_max\}\?/g, 'Presupuesto: €{intento.presupuesto_min} - €{intento.presupuesto_max}'],
  [/�'�/g, '€'],
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;
  for (const [pattern, replacement] of replacements) {
    updated = updated.replace(pattern, replacement);
  }
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`Fixed: ${file}`);
  } else {
    console.log(`No changes: ${file}`);
  }
}
