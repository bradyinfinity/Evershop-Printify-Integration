const axios = require('axios');
const { getEnv } = require('@evershop/evershop/src/lib/util/getEnv');

const apiKey = getEnv('PRINTIFY_API_KEY');
const shopId = getEnv('PRINTIFY_SHOP_ID');

export const fetchData = async () => {
  try {
    const response = await axios.get(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};