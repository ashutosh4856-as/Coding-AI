import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Auth Functions ───────────────────────────────────────────────

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } }
  })
  return { data, error }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─── Chat History Functions ───────────────────────────────────────

export async function createChat(userId, title) {
  const { data, error } = await supabase
    .from('chats')
    .insert([{ user_id: userId, title, created_at: new Date().toISOString() }])
    .select()
  return { data: data?.[0], error }
}

export async function getUserChats(userId) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function deleteChat(chatId) {
  const { error } = await supabase.from('chats').delete().eq('id', chatId)
  await supabase.from('messages').delete().eq('chat_id', chatId)
  return { error }
}

export async function saveMessage(chatId, role, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ chat_id: chatId, role, content, created_at: new Date().toISOString() }])
    .select()
  return { data: data?.[0], error }
}

export async function getChatMessages(chatId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function updateChatTitle(chatId, title) {
  const { error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId)
  return { error }
}
