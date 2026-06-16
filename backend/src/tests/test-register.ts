// src/tests/test-register.ts
async function testRegister() {
  const response = await fetch('http://localhost:5000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nom: 'Rakoto',
      prenom: 'Jean',
      email: `test${Date.now()}@example.com`, // email unique à chaque run
      mot_de_passe: 'MotDePasse123!',
    }),
  });

  const data = await response.json();
  console.log('Statut:', response.status);
  console.log('Réponse:', data);
}

testRegister();