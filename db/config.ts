import { column, defineDb, defineTable } from 'astro:db';

const Record = defineTable({
  columns: {
    url: column.text(),
    environment: column.text(),
    manager: column.text(),
  }
})


// https://astro.build/db/config
export default defineDb({
  tables: { Record },
});
