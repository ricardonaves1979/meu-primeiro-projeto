const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function testarConexao() {
  console.log('🔌 Conectando ao Supabase...')
  
  const { data, error } = await supabase
    .from('teste')
    .select('*')
    .limit(1)

  if (error && error.code === '42P01') {
    console.log('✅ Conexão com Supabase funcionando!')
    console.log('📋 Banco de dados pronto para uso.')
  } else if (error) {
    console.log('✅ Supabase conectado! Detalhes:', error.message)
  } else {
    console.log('✅ Supabase conectado com sucesso!')
  }
}

testarConexao()
