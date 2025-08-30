import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iifqhntvowbvwwgrlngn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZnFobnR2b3didnd3Z3JsbmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDM4NzEsImV4cCI6MjA3MTkxOTg3MX0.n1odG7TkZ15AdOQSsWYFzJTTPGREcjpuUeJzBh5eQwA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
