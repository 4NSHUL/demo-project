import { createLocalComplaintService } from './localComplaintService.js'
import { createSupabaseComplaintService } from './supabaseComplaintService.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)

export const storageMode = hasSupabase ? 'supabase' : 'local'

export const complaintService = hasSupabase
  ? createSupabaseComplaintService({ url: supabaseUrl, anonKey: supabaseAnonKey })
  : createLocalComplaintService(globalThis.localStorage)
