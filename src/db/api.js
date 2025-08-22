// API for CRUD and ordering
const { ipcMain } = require('electron');
const { db } = require('./sqlite');

// Fetch all objects, ordered by category and position
ipcMain.handle('get-objects', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM objects ORDER BY category, position', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => ({ ...row, taken: !!row.taken })));
    });
  });
});

// Add a new object
ipcMain.handle('add-object', async (event, obj) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO objects (category, name, data, position, taken) VALUES (?, ?, ?, ?, ?)',
      [obj.category, obj.name, obj.data, obj.position, obj.taken ? 1 : 0],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
});

// Update object position/order
ipcMain.handle('update-object-position', async (event, { id, position }) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE objects SET position = ? WHERE id = ?', [position, id], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
});

// Update object data
ipcMain.handle('update-object', async (event, obj) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE objects SET name = ?, data = ?, taken = ? WHERE id = ?',
      [obj.name, obj.data, obj.taken ? 1 : 0, obj.id],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
});

// Delete object
ipcMain.handle('delete-object', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM objects WHERE id = ?', [id], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
});
