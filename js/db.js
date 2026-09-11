const db = new Dexie('Talon_Trace_db')

db.version(1).stores({
  trail: '++id, name, created_at'
})