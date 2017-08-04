var axios = require('axios');

// axios.defaults.headers.common['Authorization'] = 'Bearer ' + <Personal Access Token>;
var locationId = <LOCATION_ID>;

axios({
  method:'post',
  url:'https://connect.squareup.com/v2/locations/'+ locationId + '/transactions',
  headers: {'Authorization': 'Bearer ' + <Personal Access Token>},
  data: {
    "idempotency_key": <GUID>,
    "shipping_address": {
      "address_line_1": "123 Main St",
      "locality": "San Francisco",
      "administrative_district_level_1": "CA",
      "postal_code": "94114",
      "country": "JP"
    },
    "billing_address": {
      "address_line_1": "500 Electric Ave",
      "address_line_2": "Suite 600",
      "administrative_district_level_1": "NY",
      "locality": "New York",
      "postal_code": "10003",
      "country": "JP"
    },
    "amount_money": {
      "amount": 100,
      "currency": "USD"
    },
    "card_nonce": <CARD_NONCE>,
    "reference_id": "some optional reference id",
    "note": "some optional note",
    "delay_capture": true
  }
})
  .then(function (response) {
    console.log(JSON.stringify(response.data));
    var transactionId = response.data.transaction.id;
    axios({
      method:'post',
      url:'https://connect.squareup.com/v2/locations/'+ locationId + '/transactions/' + transactionId + '/capture',
      headers: {'Authorization': 'Bearer ' + <Personal Access Token>}
    })
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error.response.data);
      });
  })
  .catch(function (error) {
    console.log(error.message);
    console.log(error.response.data);
  });
