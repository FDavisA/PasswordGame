const axios = require('axios');

async function testAxios() {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
    console.log('Data:', response.data);
  } catch (error) {
    console.log('Axios error:', error);
  }
}

testAxios();