import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

export async function buscarPerfilUsuario() {
  const {
    data: { user },
    error: erroUsuario
  } = await supabase.auth.getUser()

  if (erroUsuario || !user) {
    console.error(
      'Erro ao identificar usuário:',
      erroUsuario
    )

    return null
  }

  const {
    data: perfil,
    error: erroPerfil
  } = await supabase
    .from('perfis')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (erroPerfil || !perfil) {
    console.error(
      'Erro ao carregar perfil:',
      erroPerfil
    )

    return null
  }

  const {
    data: fazenda,
    error: erroFazenda
  } = await supabase
    .from('fazendas')
    .select('*')
    .eq('id', perfil.fazenda_id)
    .single()

  if (erroFazenda) {
    console.error(
      'Erro ao carregar fazenda:',
      erroFazenda
    )
  }

  return {
    ...perfil,
    email: user.email,
    fazendas: fazenda || null
  }
}