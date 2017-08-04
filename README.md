# Square E-commerce Workflow
This repo is a documentation of how to use **Square Ecommerce APIs** with your web application. The overview and technical architecture will give you a high level understanding of how things work.

## Overview:
![Overview](https://raw.githubusercontent.com/lakshmantgld/square-Ecommerce-Workflow/master/readmeFiles/overview.png)

## Technical Architecture:
This technical architecture is same as the above overview, but from a technical component's point of view.
![Architecture Diagram](https://raw.githubusercontent.com/lakshmantgld/square-Ecommerce-Workflow/master/readmeFiles/architecture.png)

### Workflow:
**Step 1:** User submits the card details(card no, CVV, exp.date & postal code) to a form. A script library will be added to the client-side which acts as a helper library to process the card details. More information here: [Embedding Square Payment Form](https://docs.connect.squareup.com/articles/adding-payment-form). **P.S:** Postal code is optional depending upon the country where the application is focused. For more information on this, refer to the above link.

**Step 2:** This step is an important step as suggested by **PCI DSS** association. No credit card information must go/stored to the application's backend, so we send it straight to the Square Endpoint from the client.

**Step 3:** You would have received an **cardNonce** from the request sent in the previous step. This cardNonce represents the card details. This will be sent to the application server for further processing. Notice that, we are not sending the card details, we are sending only nonce, which is an anonymized for the card details.

**Step 4:** Now, we start the process of charging the customer for the shipment to be made. This is a little longer step, we will go through with sub-sections. The requirement for this step and all the corresponding steps are `Application ID` and `Personal Access Token`. These can be obtained by registering into Square. **P.S:** All the requests to the **Square Endpoint** must contain the `Personal Access Token` in the `Authorization` header.

**4.1:** We need to get the **locations** associated with Square account. Once we get that, we have to choose one of the locations and use that `locationId` to charge the customer. More Information: [ListLocations](https://docs.connect.squareup.com/api/connect/v2#endpoint-listlocations).

```js
axios({
  method:'get',
  url:'https://connect.squareup.com/v2/locations',
  headers: {'Authorization': 'Bearer ' + <Personal Access Token>}
})
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
```

**4.2:** Finally, we can charge the customer for the shipment. This can be done in two ways, either **delay the transaction** or **charge the transaction** immediately. The `delayTransaction` will not charge the customer immediately, it will first authorize the card and we can make a call to capture the authorized transaction in the near future. This is very handy, as you might have to perform other mission critical operations and based on the result of those operations, you may decide to charge the card. More Information: [Transaction](https://docs.connect.squareup.com/api/connect/v2#endpoint-charge)

**4.2.1: Delay the Transaction**

```js
axios({
  method:'post',
  url:'https://connect.squareup.com/v2/locations/'+ <LOCATION_ID_FROM_STEP-4.1> + '/transactions',
  headers: {'Authorization': 'Bearer ' + <Personal Access Token>},
  data: {
    "idempotency_key": <GUID>,
    "buyer_email_address": "abc@gmail.com",
    "shipping_address": {
      "address_line_1": "Room no: 1121, 3-21-2",
      "locality": "Shin Yokohama",
      "administrative_district_level_1": "Kanagawa",
      "postal_code": "220033",
      "country": "JP"
    },
    "billing_address": {
      "address_line_1": "Room no: 1121, 3-21-2",
      "locality": "Shin Yokohama",
      "administrative_district_level_1": "Kanagawa",
      "postal_code": "220033",
      "country": "JP"
    },
    "amount_money": {
      "amount": 100,
      "currency": "USD"
    },
    "card_nonce": <CARD_NONCE_FROM_STEP-3>,
    "reference_id": "some optional reference id",
    "note": "some optional note",
    "delay_capture": true
  }
})
  .then(function (response) {
    console.log(JSON.stringify(response.data));
    /*
    The response will contain transactionId and tenders. Tenders in turn will contain
    tenderId, cardDetails and so on.
    */
  })
  .catch(function (error) {
    console.log(error.response.data);
  });
```
`delay_capture: true`: This will delay the transaction, the response `tender.card_details.status` will be `AUTHORIZED` not `CAPTURED`. If you want the charge the user immediately, use `delay_capture: false`.

`idempotency_key`: A value that uniquely identifies this transaction among transactions you've created. If you're unsure whether a particular transaction succeeded, you can reattempt it with the same idempotency key without worrying about double-charging the buyer. More information: [idempotency Key](https://docs.connect.squareup.com/api/connect/v2#idempotencykeys).

`buyer_email_address` and `billing_address` or `shipping_address` is required to eligible for [Square chargeback protection](https://squareup.com/help/article/5394).

**step 5: Capturing the Delayed Transaction**

This requires the `transactionId` and `locationId` of the delayed transaction.

```js
axios({
  method:'post',
  url:'https://connect.squareup.com/v2/locations/'+ <LOCATION_ID_FROM_STEP-4.1> + '/transactions/' + <TRANSACTION_ID_FROM_STEP-4.2.1> + '/capture',
  headers: {'Authorization': 'Bearer ' + <Personal Access Token>}
})
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error.response.data);
  });
```

The `200` status code means, capturing the delayed transaction was successful.

**P.S: Refunding a Transaction**

**Charge Back** and **Refund** are completely two different process. **Refund** is carried out by the seller, whereas **Charge Back** is by the buyer/customer. More Information on [Charge Back](https://squareup.com/help/article/5394).

**Refunding** an transaction requires `locationId`, `transactionId` and the `tenderId`.
```js
axios({
  method:'post',
  url:'https://connect.squareup.com/v2/locations/'+ <LOCATION_ID_FROM_STEP-4.1> + '/transactions/' + <TRANSACTION_ID_FROM_STEP-4.2.1> + '/refund',
  headers: {'Authorization': 'Bearer ' + <Personal Access Token>},
  data: {
    "idempotency_key": <GUID>,
    "tender_id": <TENDER_ID_FROM_STEP-4.2.1>,
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
```
