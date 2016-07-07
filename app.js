'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var MP = require("mercadopago");
var app = express();

app.use(express.static(__dirname));
app.use(bodyParser());

var mp = new MP("TEST-6911044918693904-062415-b50e41c7d05f1e30f9c57f818a861882__LA_LC__-167345144");

//***************************************************************************PAYMENTS******************************************************************************************************

//-------------------------------------------metodo post para enviar o pagamento---------------------------------------------------------------

app.post("/post/payments", (req, res) => {
    var reqAux = req;
    let postData = {
        "transaction_amount": parseInt(req.body.amount),
        "token": req.body.token,
        "description": "Pagamento Aquarela Papeis Site MercadoPago",
        "installments": parseInt(req.body.installments),
        "payment_method_id": req.body.paymentMethodId,
        "payer": {
            "email": req.body.email
        }
    };
    let cardToken = {
            token: postData.token
        }
        // console.log('body ' + JSON.stringify(req.body));
    console.log(postData);
    mp.post({
            "uri": "/v1/payments",
            "data": postData
        })
        .then(payment => {
            console.log(payment);
            // res.send(payment);
            //--------------------------------------------Saves a new card to the customer--------------------------------------------------------
            var customer = {
                email: req.body.email
            };

            mp.get("/v1/customers/search", customer)
                .then(resCustomer => {
                    mp.post({
                            "uri": "/v1/customers/" + resCustomer.response.results[0].id + "/cards",
                            "data": cardToken
                        })
                        .then(addNewCard => {
                                console.log(addNewCard);
                                res.send(addNewCard);
                            },
                            err => {
                                console.log(err.message);
                                res.send(err);
                            });
                }, err => {
                    console.log(err);
                    // res.send(err);
                });


            //--------------------------------------------Saves a new card to the customer--------------------------------------------------------
        }, err => {
            console.log(err);
            // res.send(err);
        });
});
//-------------------------------------------metodo get para visualizar o pagamento---------------------------------------------------------------
app.get("/get/payments", (req, res) => {
  var filters = {
      "email": "ivan-eijy@hotmail.com"
  };
  mp.get("/v1/customers/search", filters)
    .then(resCustomer => {
      mp.get("/v1/payments/1467154077749" )
          .then(paymentData => {
              console.log(paymentData);
              res.send(paymentData)
          }, err => {
              console.log(err);
              res.send(err);
          });
    },err => {
        console.log(err);
        res.send(err);
    });
});
//***************************************************************************FIM DO PAYMENTS********************************************************************************************************





//***************************************************************************CUSTOMERS & CARDS******************************************************************************************************

//------------------------------------------------------------------------Edita os dados do cliente-----------------------------------------------------------------------------
app.post("/post/customers/updateCustomer", (req, res) => {
    var obj = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: {
            area_code: "11",
            number: req.body.phone
        },
        identification: {
            type: "CPF",
            number: req.body.cpf
        },
        default_address: "",
        address: {
            zip_code: req.body.zip_code,
            street_name: req.body.street_name,
            street_number: parseInt(req.body.street_number)
        }
    };
    var customer = {
        email: req.body.email,
    }
    mp.get("/v1/customers/search", customer)
        .then(resCustomer => {
            mp.put({
                    "uri": "/v1/customers/" + resCustomer.response.results[0].id,
                    "data": obj
                })
                .then(updateCustomer => {
                    console.log(updateCustomer);
                    res.send(updateCustomer);
                }, err => {
                    console.log(err);
                    res.send(err);
                });
        }, err => {
            console.log(err);
        });
});

//------------------------------------------------------------------------------Editar o cartao----------------------------------------------------------------------------------------
app.post("/post/customers/updateCard", (req, res) => {
    var customer = {
        email: req.body.email
    };

    var dataAux = {
        expiration_month: req.body.cardExpirationMonth,
        expiration_year: req.body.cardExpirationYear,
        first_six_digits: req.body.cardNumber.slice(0, 6),
        last_four_digits: req.body.cardNumber.slice(12, 16),
        payment_method: {
            id: "",
            name: "",
            payment_type_id: "",
            thumbnail: "",
            secure_thumbnail: ""
        },
        security_code: {
            length: 3,
            card_location: ""
        },
        issuer: {
            id: 0,
            name: ""
        },
        cardholder: {
            name: req.body.cardholderName,
            identification: {
                number: req.body.docNumber,
                subtype: "",
                type: ""
            },
        },
        date_created: "27/06/2016",
        date_last_updated: "27/06/2016"
    };
    mp.get("/v1/customers/search", customer)
        .then(resCustomer => {
            mp.put({
                    "uri": "/v1/customers/" + resCustomer.response.results[0].id + "/cards/" + resCustomer.response.results[0].cards[0].id,
                    "data": dataAux
                })
                .then(updateCard => {
                    console.log(updateCard);
                    res.send(updateCard);
                }, err => {
                    console.log(err);
                    res.send(err);
                });
        }, err => {
            console.log(err);
        });
});

//------------------------------------------------------------------------Criando um novo cliente-------------------------------------------------------------------
app.post("/post/createCustomers", (req, res) => {
    let template = require('./request_mock.json');

    let obj = Object.assign({}, template);

    obj.email = req.body.email;
    obj.first_name = req.body.first_name;
    obj.last_name = req.body.last_name;
    obj.phone.number = req.body.phone;
    obj.identification.number = req.body.identification;
    obj.address.zip_code = req.body.zip_code;
    obj.address.street_name = req.body.street_name;
    obj.address.street_number = parseInt(req.body.street_number);
    obj.date_registered = new Date();
    obj.description = "";
    obj.date_created = new Date();
    obj.date_last_updated = new Date();
    obj.metadata = {};

    mp.post({
            "uri": "/v1/customers/",
            "data": obj
        })
        .then(customer => {
            console.log(customer);
            res.send(customer);
        }, err => {
            console.log(err);
            res.send(err);
        });
});

//-----------------------------------------------------Buscar todos cartões cadastrados de um cliente por ID--------------------------------------------------------
app.get("/get/customers/:id", (req, res) => {
    mp.get("/v1/customers/" + req.params.id + "/cards")
        .then(cards => {
            console.log(cards);
            res.send(cards);
        }, err => {
            console.log(error);
            res.send(cards);
        });
});

//---------------------------------------------------Buscar um cliente por varios criterios (neste caso so esta sendo filtrado por email)--------------------------------
app.get("/get/customer/filter", (req, res) => {
    var filters = {
        "email": "testesd@test.com"
    }
    mp.get("/v1/customers/search", filters)
        .then(customer => {
            console.log(customer);
            res.send(customer);
        }, err => {
            console.log(err);
            res.send(err);
        });
});

//----------------------------------------------------Buscar um cliente----------------------------------------------------------------------------------------------------
app.get("/get/customer/:id", (req, res) => {
    mp.get("/v1/customers/" + req.params.id)
        .then(customer => {
            console.log(customer);
            res.send(customer);
        }, err => {
            console.log(err);
            res.send(err);
        });
});

//----------------------------------------------------Buscar um cliente a partir de um cartao-------------------------------------------------------------------------------
// app.get("/get/customer/card/", (req, res) => {
//     mp.get("/v1/customers/" + req.params.id + "/cards/" + idcard)
//   });



//***************************************************************************CUSTOMERS & CARDS******************************************************************************************************


app.listen(8000);
