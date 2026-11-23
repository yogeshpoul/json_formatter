/** Example documents for the "Sample" buttons. Fictional data only. */

export const sampleJson = `{"id":1024,"name":"Ada Lovelace","email":"ada@example.com","active":true,"roles":["admin","editor"],"profile":{"timezone":"Europe/London","languages":["en","fr"],"lastLogin":"2026-03-14T09:26:53Z","preferences":{"theme":"dark","notifications":{"email":true,"sms":false}}},"projects":[{"id":"p-1","title":"Analytical Engine","stars":512,"budget":12500.75,"archived":false},{"id":"p-2","title":"Notes on the Engine","stars":128,"budget":null,"archived":true}],"orderId":12345678901234567890}`;

export const sampleInvalidJson = `{
  "name": "Ada Lovelace",
  "roles": ["admin", "editor",],
  'active': true,
  "projects": [
    { "id": "p-1" "stars": 512 }
  ]
}`;

export const sampleRecords = `[
  {"id": 1, "name": "Ada Lovelace", "email": "ada@example.com", "address": {"city": "London", "country": "UK"}, "tags": ["math", "computing"]},
  {"id": 2, "name": "Alan Turing", "email": "alan@example.com", "address": {"city": "Manchester", "country": "UK"}, "tags": ["logic"]},
  {"id": 3, "name": "Grace Hopper", "email": "grace@example.com", "address": {"city": "New York", "country": "US"}, "active": true}
]`;

export const sampleDiffLeft = `{
  "name": "inventory-service",
  "version": "1.4.0",
  "replicas": 3,
  "features": { "cache": true, "metrics": false },
  "regions": ["eu-west-1", "us-east-1"],
  "owner": "platform-team"
}`;

export const sampleDiffRight = `{
  "name": "inventory-service",
  "version": "1.5.0",
  "replicas": 3.0,
  "features": { "cache": true, "metrics": true, "tracing": true },
  "regions": ["eu-west-1"],
  "maintainers": ["platform-team"]
}`;

export const sampleEscapeText = `{"message": "Hello, \"world\"!", "path": "C:\\Users\\ada"}
Second line with a tab:	done`;

export const sampleUnescapeText = `{\\"level\\":\\"error\\",\\"message\\":\\"Connection refused\\\\nretrying in 5s\\",\\"code\\":503}`;
