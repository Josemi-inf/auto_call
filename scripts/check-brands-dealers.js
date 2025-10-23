import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'n8n-pgvector-pgweb.ko9agy.easypanel.host',
  port: 5432,
  database: 'autos_call',
  user: 'postgres',
  password: 'ae5549e37573f5ce67f6',
  ssl: false
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check existing lead
    const lead = await client.query(`
      SELECT lead_id, nombre, apellidos, email, telefono
      FROM leads
      LIMIT 1
    `);
    console.log('📊 Lead actual:');
    console.table(lead.rows);

    // Check marcas
    const marcas = await client.query(`
      SELECT marca_id, nombre
      FROM marca
      ORDER BY nombre
    `);
    console.log('\n📊 Marcas disponibles:');
    console.table(marcas.rows);

    // Check concesionarios
    const concesionarios = await client.query(`
      SELECT concesionario_id, nombre
      FROM concesionario
      ORDER BY nombre
    `);
    console.log('\n📊 Concesionarios disponibles:');
    console.table(concesionarios.rows);

    // Check concesionario_marca relationships
    const cm = await client.query(`
      SELECT
        cm.concesionario_marca_id,
        c.nombre as concesionario,
        m.nombre as marca
      FROM concesionario_marca cm
      JOIN concesionario c ON cm.concesionario_id = c.concesionario_id
      JOIN marca m ON cm.marca_id = m.marca_id
      ORDER BY c.nombre, m.nombre
    `);
    console.log('\n📊 Relaciones Concesionario-Marca:');
    console.table(cm.rows);

    // Check existing lead_concesionario_marca
    const lcm = await client.query(`
      SELECT
        lcm.lead_concesionario_marca_id,
        l.nombre as lead_nombre,
        c.nombre as concesionario,
        m.nombre as marca,
        lcm.estado
      FROM lead_concesionario_marca lcm
      JOIN leads l ON lcm.lead_id = l.lead_id
      JOIN concesionario_marca cm ON lcm.concesionario_marca_id = cm.concesionario_marca_id
      JOIN concesionario c ON cm.concesionario_id = c.concesionario_id
      JOIN marca m ON cm.marca_id = m.marca_id
    `);
    console.log('\n📊 Lead-Concesionario-Marca existentes:');
    console.table(lcm.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
