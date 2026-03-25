async function testSessionApi() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/session');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Body snippet:', text.substring(0, 100));
    
    try {
      JSON.parse(text);
      console.log('Valid JSON!');
    } catch (e) {
      console.log('NOT Valid JSON!');
    }
  } catch (err) {
    console.error('Error fetching session:', err);
  }
}

testSessionApi();
