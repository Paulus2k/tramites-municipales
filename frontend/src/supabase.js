import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eameixtdkokjbabvhhtt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbWVpeHRka29ramJhYnZoaHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTEyNDgsImV4cCI6MjA5NDE4NzI0OH0.VzEQUFlM_QNBDv9MCS9HJhsmgmf_XWDOShhBiYhG5Ro'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)