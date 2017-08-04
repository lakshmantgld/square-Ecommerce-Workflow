var axios = require('axios');

// axios.defaults.headers.common['Authorization'] = 'Bearer ' + 'sandbox-sq0atb-0ktMu32VHfPkL5vmNDb9cw';
var locationId = <LOCATION_ID>;
var transactionId = <TRANSACTION_ID>;

axios({
  method:'post',
  url:'https://connect.squareup.com/v2/locations/'+ locationId + '/transactions/' + transactionId + '/refund',
  headers: {'Authorization': 'Bearer ' + <Personal Access Token>},
  data: {
    "idempotency_key": <GUID>,
    "tender_id": <TENDER_ID>,
    "reason": "a reason",
    "amount_money": {
      "amount": 100,
      "currency": "USD"
    }
  }
})
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error.response.data);
  });
