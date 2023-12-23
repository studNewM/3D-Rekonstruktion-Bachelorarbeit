import path from 'node:path';
import fs from 'node:fs';
import { WebSocket } from 'ws';

export default function monitorLog(directory, pattern, commandName, wss) {
    let lastSize = 0;
    let lastFileChecked = '';

    const intervalId = setInterval(() => {
        const logFilePath = findLatestLogFile(directory, pattern);

        if (logFilePath !== lastFileChecked) {
            lastFileChecked = logFilePath;
            lastSize = 0;
        }

        if (logFilePath) {
            fs.stat(logFilePath, (err, stats) => {
                if (err) {
                    console.error(`Fehler beim Zugriff auf Log-Datei ${logFilePath}:`, err);
                    return;
                }

                if (stats.size > lastSize) {
                    const stream = fs.createReadStream(logFilePath, { start: lastSize, end: stats.size });
                    stream.on('data', (data) => {
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(`${commandName} update:\n${data.toString()}`);
                            }
                        });
                    });
                    lastSize = stats.size;
                }
            });
        }
    }, 10000); // Überprüfung alle 1 Sekunde

    return () => {
        clearInterval(intervalId);
    };
}



function findLatestLogFile(directory, pattern) {
    let latestFile;
    let latestTime = 0;
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        if (pattern.test(file)) {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);
            if (stat.mtimeMs > latestTime) {
                latestFile = filePath;
                latestTime = stat.mtimeMs;
            }
        }
    });
    console.log(latestFile);
    return latestFile;
}


