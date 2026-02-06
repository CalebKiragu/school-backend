import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Database configuration from environment
const dataSource = new DataSource({
  type: 'mysql',
  host:
    process.env.DB_HOST ||
    'master-sql.cc1zpwoqvmxn.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'master',
  password: process.env.DB_PASSWORD || 'UdTbIgzmIzU4O6LoqTvB',
  database: process.env.DB_DATABASE || 'sigalame',
  synchronize: false,
  logging: true,
});

async function importData() {
  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'import-data.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL statements (better parsing)
    const statements = sqlContent
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}`);
          await dataSource.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(
            `❌ Error executing statement ${i + 1}:`,
            error.message,
          );
          // Continue with other statements
        }
      }
    }

    // Now create/recreate the views
    console.log('🔄 Creating database views...');
    const viewsFilePath = path.join(
      __dirname,
      'migrations',
      'create-views.sql',
    );
    const viewsContent = fs.readFileSync(viewsFilePath, 'utf8');

    const viewStatements = viewsContent
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (let i = 0; i < viewStatements.length; i++) {
      const statement = viewStatements[i];
      if (statement.trim()) {
        try {
          console.log(
            `⚡ Executing view statement ${i + 1}/${viewStatements.length}`,
          );
          await dataSource.query(statement);
          console.log(`✅ View statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(
            `❌ Error executing view statement ${i + 1}:`,
            error.message,
          );
        }
      }
    }

    console.log('🎉 Data import completed successfully!');

    // Test the data
    console.log('🧪 Testing imported data...');
    const userCount = await dataSource.query(
      'SELECT COUNT(*) as count FROM user',
    );
    const studentCount = await dataSource.query(
      'SELECT COUNT(*) as count FROM student_contacts',
    );
    const feeCount = await dataSource.query(
      'SELECT COUNT(*) as count FROM fee_payments',
    );
    const examCount = await dataSource.query(
      'SELECT COUNT(*) as count FROM exam_results',
    );

    console.log(`📊 Data summary:`);
    console.log(`   - Users: ${userCount[0].count}`);
    console.log(`   - Students: ${studentCount[0].count}`);
    console.log(`   - Fee records: ${feeCount[0].count}`);
    console.log(`   - Exam results: ${examCount[0].count}`);
  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the import
importData().catch(console.error);
