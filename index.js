const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function main() {
  console.log('🚀 Testando Supabase...\n')

  // 1. Inserir contato
  console.log('1️⃣  Inserindo seu contato...')
  const { data: inserido, error: erroInsert } = await supabase
    .from('contatos')
    .insert({ nome: 'Ricardo Naves', email: 'ricardonaves@gmail.com' })
    .select()

  if (erroInsert) {
    console.log('❌ Erro ao inserir:', erroInsert.message)
  } else {
    console.log('✅ Contato inserido com sucesso!', inserido)
  }

  // 2. Buscar todos os contatos
  console.log('\n2️⃣  Buscando contatos...')
  const { data: contatos, error: erroBusca } = await supabase
    .from('contatos')
    .select('*')

  if (erroBusca) {
    console.log('❌ Erro ao buscar:', erroBusca.message)
  } else {
    console.log('✅ Contatos no banco:', contatos)
  }
}

main()
