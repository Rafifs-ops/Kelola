async function testStockAPI() {
  const url = 'http://localhost:3000/api/saham?symbols=BBCA,BBRI';
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testStockAPI();
