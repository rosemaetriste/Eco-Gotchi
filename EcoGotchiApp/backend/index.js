const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Basic auth simulation
let users = [
  { id: 1, email: 'user@example.com', password: 'password123', name: 'Eco Guardian' },
];

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((item) => item.email === email && item.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ user: { id: user.id, email: user.email, name: user.name }, token: 'demo-token' });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const exists = users.some((item) => item.email === email);
  if (exists) {
    return res.status(409).json({ error: 'Email already in use.' });
  }

  const id = users.length + 1;
  const user = { id, email, password, name };
  users.push(user);

  res.status(201).json({ user: { id, email, name }, token: 'demo-token' });
});

app.get('/api/pet', (req, res) => {
  res.json({ name: 'Luna', mood: 'Blooming', level: 5, progress: 78 });
});

app.listen(port, () => {
  console.log(`Eco-Gotchi backend running on http://localhost:${port}`);
});
