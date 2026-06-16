import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually
const envPath = join(__dirname, '.env');
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
const envConfig = {};
for (const line of lines) {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    envConfig[key] = value;
  }
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*, grades(*)')
      .limit(1);

    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Student Data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Execution Error:', err);
  }
}

test();
