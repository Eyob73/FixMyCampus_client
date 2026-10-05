const fs = require('fs');
const content = fs.readFileSync('src/app/core/services/mock-data.ts', 'utf8');

const updated = content.replace(
  /\{\s*id:\s*'([^']+)',\s*ticketId:\s*'([^']+)',\s*status:\s*'([^']+)',\s*title:\s*'([^']+)',\s*description:\s*'([^']+)',\s*timestamp:\s*'([^']+)',\s*actorName:\s*'([^']+)'\s*\}/g,
  (match, id, ticketId, status, title, description, timestamp, actorName) => {
    return `{
        id: '${id}',
        ticketId: '${ticketId}',
        type: 'STATUS_CHANGE',
        content: '${description.replace(/'/g, "\\'")}',
        author: {
          id: 'u-1',
          name: '${actorName.replace(/'/g, "\\'")}',
          role: 'SYSTEM'
        },
        timestamp: '${timestamp}'
      }`;
  }
);

fs.writeFileSync('src/app/core/services/mock-data.ts', updated);
console.log('Done!');
