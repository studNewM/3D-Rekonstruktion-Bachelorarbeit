import WebSocket from 'ws';

// Erstellen Sie eine neue WebSocket-Instanz, die sich mit Ihrem WebSocket-Server verbindet
const ws = new WebSocket('ws://127.0.0.1:8080');

// Event-Handler, der aufgerufen wird, wenn die Verbindung geöffnet wird
ws.on('open', function open() {
  console.log('Verbunden mit dem Server');
  ws.send('Hallo Server!');
});

// Event-Handler, der aufgerufen wird, wenn eine Nachricht vom Server empfangen wird
ws.on('message', function incoming(data) {
  console.log('Erhaltene Nachricht vom Server:', data);
});

// Event-Handler für Fehler
ws.on('error', function error(error) {
  console.error('WebSocket-Fehler:', error);
});

// Event-Handler für das Schließen der Verbindung
ws.on('close', function close() {
  console.log('Verbindung geschlossen');
});