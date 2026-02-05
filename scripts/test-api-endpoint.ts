
import axios from 'axios';

async function testApi() {
    console.log('--- Testing API Endpoint ---');
    const url = 'http://localhost:8787/api/municipio/respostas-detalhadas';
    const params = {
        municipio: 'BETIM',
        ano: 2024,
        indicador: 'i-Educ' // Tentando com Case exato do DB
    };

    console.log(`GET ${url}`, params);

    try {
        const res = await axios.get(url, { params });
        console.log('Status:', res.status);
        console.log('Data count:', res.data.length);
        if (res.data.length > 0) {
            console.log('Sample:', res.data[0]);
        } else {
            console.log('❌ No data returned');
        }

        console.log('\n--- Testing Case Insensitivity ---');
        const params2 = {
            municipio: 'Betim',
            ano: 2024,
            indicador: 'i-educ' // Lower case
        };
        const res2 = await axios.get(url, { params: params2 });
        console.log('Data count (case insensitive):', res2.data.length);

    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testApi();
