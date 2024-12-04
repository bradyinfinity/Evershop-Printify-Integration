const { select } = require('@evershop/postgres-query-builder');
const { getEnv } = require('@evershop/evershop/src/lib/util/getEnv');
const axios = require('axios');
const { error } = require('@evershop/evershop/src/lib/log/logger');

module.exports = async function placeOrder(orderData) {
  try {
    const apiKey = getEnv('PRINTIFY_API_KEY');
    const shopId = getEnv('PRINTIFY_SHOP_ID');
    const baseUrl = `https://api.printify.com/v1/shops/${shopId}/orders.json`;

    if (!apiKey || !from) {
      return;
    }

    // Fetch order details
    const orderId = orderData.order_id;
    const order = await select()
      .from('order')
      .where('order_id', '=', orderId)
      .load(pool);

    if (!order) {
      return;
    }

    // Fetch items
    orderItems = await select()
      .from('order_item')
      .where('order_item_order_id', '=', order.order_id)
      .execute(pool);

    const line_items = orderItems.map(item => ({
      product_id: item.product_id,
      variant_id: item.product_sku,
      quantity: item.qty
    }));

    // Fetch shipping address details
    const shippingAddress = await select()
      .from('order_address')
      .where('order_address_id', '=', order.shipping_address_id)
      .load(pool);
    
    // Prepare Printify order data
    const printifyOrderPayload = {
      "external_id": orderId.toString(),
      "label": order.sid,
      "line_items": line_items,
      "shipping_method": 1,
      "is_printify_express": false,
      "is_economy_shipping": false,
      "send_shipping_notification": true,
      "address_to": {
        "first_name": shippingAddress.full_name,
        "last_name": "",
        "email": order.customer_email,
        "phone": shippingAddress.telephone,
        "country": shippingAddress.country,
        "region": shippingAddress.province_name,
        "address1": shippingAddress.address_1,
        "address2": shippingAddress.address_2,
        "city": shippingAddress.city,
        "zip": shippingAddress.postcode
      }
    }

    const url = `${baseUrl}`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(printifyOrderPayload)
    };
  } catch (e) {
    error(e);
  }

  try {
    await axios.post(url, printifyOrderPayload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.data.ok) {
      error(`Error placing Printify order: ${await response.text()}`);
    }
    const result = response.data;
    console.log('Printify order created successfully:', result);
  } catch (error) {
    error('Error placing Printify order:', error);
  }

};