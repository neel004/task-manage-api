const mailgun = require("mailgun-js");
const DOMAIN = "sandboxd10e8bc0077f4aba8eb111c6e3fdeadc.mailgun.org";
const mg = mailgun({apiKey: process.env.APIKEY, domain: DOMAIN});


const sendWelcomeEmail = (email,name) =>{
	const data = {
		from: "Mailgun Sandbox <postmaster@sandboxcfaa30d98d0346978a53740af51db3f2.mailgun.org>",
		to: email,
		subject: "Thanks For Joining In",
		text: `Welcome to the app, ${name}. Let me know how you get along with app.`
	};
	mg.messages().send(data, function (error, body) {	
		if(error){
			console.log(error)
		}
		console.log(body);
	});
}

const sendGoodByEmail = (email,name) =>{
	const data = {
		from: "Mailgun Sandbox <postmaster@sandboxcfaa30d98d0346978a53740af51db3f2.mailgun.org>",
		to: email,
		subject: "Hope We Will Meet Again",
		text: `GoodBy , ${name}. Feelfree to provide your feedback.`
	};
	mg.messages().send(data, function (error, body) {	
		if(error){
			console.log(error)
		}
		console.log(body);
	});
}

// You can see a record of this email in your logs: https://app.mailgun.com/app/logs.

// You can send up to 300 emails/day from this sandbox server.
// Next, you should add your own domain so you can send 10000 emails/month for free.

module.exports = {
	sendWelcomeEmail,
	sendGoodByEmail
}