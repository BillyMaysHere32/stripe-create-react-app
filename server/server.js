require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors")
app.use(express.json());
app.use(
  cors({
    // client url
    origin: "http://localhost:3000",
  })
)
  
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
    [1, { priceInCents: 10000, name: "Learn React Today" }],
    [2, { priceInCents: 20000, name: "Learn CSS Today" }],
])

app.post("/create-checkout-session", async (req, res) => {
    try {
        // func that takes in a bunch of properties and returns a session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        // we sent item info with our request, 
        // we can get it with req.body and .items bc thats the items object 
        // we sent and called it items in the body
        // then map through each item and return a new item formatted
        // in the way stripe expects it to be formatted (storeItem)
        line_items: req.body.items.map(item => {
          const storeItem = storeItems.get(item.id)
          return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: storeItem.name,
                },
                unit_amount: storeItem.priceInCents,
            },
            quantity: item.quantity,
          }
        }),
        success_url: `http://localhost:3000/`,
        cancel_url: `http://localhost:3000/`,
      })
      res.json({ url: session.url })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

app.listen(4000);