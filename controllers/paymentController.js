const stripe = require('stripe')(process.env.stripe_key);

const stripeController = async (req,res) =>{
  const paymentIntent =   await stripe.paymentIntents.create({
        amount: Number(req.body.totalAmount) * 100,
        currency: 'usd',
        
    })

    res.status(200).json({client_secret:paymentIntent.client_secret, success:true, name:req.user.name, email:req.user.email});
}

module.exports = {stripeController};