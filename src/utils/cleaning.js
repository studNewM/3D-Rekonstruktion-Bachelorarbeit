import path from 'node:path';
import fs from 'node:fs';

export default async function deleteBinFiles(directory) {
    fs.readdir(directory, (err, files) => {
      if (err) throw err;
  
      for (const file of files) {
        if (path.extname(file) === '.bin') {
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
      }
    });
  }