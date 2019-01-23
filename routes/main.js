const express = require("express");
const mainRouter = express.Router();
const fs = require("fs");
const Participant = require("../models/Participant");
const mongoose = require("mongoose");
const config = require("../settings/config");
const nodemailer = require("nodemailer");
var pdf = require('html-pdf');

mainRouter.post("/participant", function (req, res) {
	console.log(req.body);

	fs.appendFileSync('logs.txt', '/particiapant ' + JSON.stringify(req.body) + "\n");
	Participant.insertNewParticipant(req.body, (status, err, data) => {
		if (status === 200) {
			fs.appendFileSync('logs.txt', 'participant insert success' + "\n");
			return res.json(data);
		} else {
			fs.appendFileSync('logs.txt', 'participant insert fail in route' + JSON.stringify(err) + "\n");
			return res.status(status).json(err);
		}
	});
});

mainRouter.post("/event", function (req, res) {
	console.log(req.body);
	fs.appendFileSync('logs.txt', '/event ' + JSON.stringify(req.body) + "\n");

	//return res.json({ success: true });
	Participant.updateEvents(req.body, (status, err, data) => {
		if (status === 200) {
			let page =
				"<!DOCTYPE html>" +
				"<html>" +
				"	<head>" +
				'	<meta charset="utf-8" />' +
				"		<style>" +
				"	.container {" +
				"		margin: 1%;" +
				"	}" +
				"	.left-container {" +
				"	padding: 5% 1%;" +
				"	}" +
				"	.middle-container {" +
				"		padding: 1%;" +
				"		}" +
				"	.right-container {" +
				"		}" +
				"	.line {" +
				"		width: 60%;" +
				"	border: 2px solid black;" +
				"		margin: 6% 20% 2px 20%;" +
				"	}" +
				"		body {" +
				"	background-color: white;" +
				"		}" +
				"	h1 {" +
				"		color: black;" +
				"			margin: 0px;" +
				"	text-align: center;" +
				"			font-weight: 300;" +
				// '	font-family: "Montserrat";' +
				"	}" +
				"		h2 {" +
				"		color: black;" +
				"	margin: 0px;" +
				"	}" +
				"	h5 {" +
				"	color: black;" +
				"	margin: 0px;" +
				"	}" +
				"	.para {" +
				"	margin-top: 10px;" +
				"		margin-bottom: 65px;" +
				"	padding-right: 20px;" +
				"	text-align: justify;" +
				"	}" +
				"		.pic {" +
				"	width: 100px;" +
				"	height: auto;" +
				"	}" +
				"	.qr {" +
				"	margin-top: 220px;" +
				"	width: 150px;" +
				"	height: auto;" +
				"	}" +
				"	.bottom-container {" +
				"	border-right: 4px solid black;" +
				"	}" +
				".list {" +
				"	padding-left: 20px;" +
				"	}" +
				"	</style>" +
				"	</head>" +
				'	<body style="background-image:url(background.jpg); max-width: 800px; height: 90%;">' +
				//'<body style="background-image:url(background3.jpg); background-repeat: no-repeat; background-size: 100% 100%; ">' +
				'<div class="left-container" style="position: absolute; left: 0px; width: 400px">' +
				"	<h1>5th NATIONAL</h1>" +
				"	<h1>ENGLISH CARNIVAL</h1>" +
				'<div class="line"></div>' +
				'	<h3 style="font-weight: bold; text-align: center">FEBRUARY 7-9, 2019</h3>' +
				'	<div class="bottom-container">' +
				'	<p class="para" style="font-size: 12px;">' +
				"	Gates open at 02:00PM on the first day and at 08:00AM on the next two" +
				"	days. Please bring this ticket for payment and participation. Print or" +
				"any electronic format is acceptable. Show this ticket, complete your" +
				"payment and get your coupons and ID card." +
				"	</p>" +
				'		<img class="pic" src="ndec_logo.png" />' +
				"	</div>" +
				"	</div>" +
				'	<div class="middle-container" style="position: absolute; left: 420px;">' +
				'<img class="pic" src="e.png" />' +
				"	<h3>Registerd Events:</h3>" +
				'	<ul class="list" style="list-style-type:square; font-size: 10px;">';
			data.individualEvent.forEach(event => {
				page = page + "	<li>" + event + "</li>";
			});
			data.teamEvent.forEach(event => {
				page =
					page +
					"	<li>" +
					event.event_name +
					" (" +
					event.team_name +
					")" +
					"</li>";
			});
			page =
				page +
				"	</ul>" +
				"	</div>" +
				'<div class="right-container" style="position: absolute; left: 700px; padding-right: 10px; ">' +
				'	<h2 style="text-align: right">' +
				data.name +
				"</h2>" +
				'		<h4 style="text-align: right">' +
				data.institution +
				"</h4>" +
				'	<h4 style="text-align: right">' +
				data.level +
				" Level</h4>" +
				'		<h5 style="text-align: right">(' +
				data.email +
				")</h5>" +
				'	<div style="height: 32%;"></div>' +
				'	<img style="float: right" class="qr" src="qr_box.png" />' +
				"	</div>" +
				"</body>" +
				"</html>";
			let pdfName = './data/' + data.email + '.pdf';
			let htmlName = './data/' + data.email + '.html';
			console.log(pdfName);
			fs.appendFileSync('logs.txt', '/event pdfname ' + pdfName + "\n");

			fs.writeFile(htmlName, page, function (err) {
				if (err) {
					fs.appendFileSync('logs.txt', "html gen error " + JSON.stringify(err) + "\n");
					console.log(err);
					return res.status(500).json({ msg: "Server error. Try again later" });
				}

				let html = fs.readFileSync("./data/" + data.email + ".html", 'utf8');

				pdf.create(html, { format: 'Letter' }).toFile(pdfName, function (err, result) {
					if (err) {
						fs.appendFileSync('logs.txt', "pdf gen error " + JSON.stringify(err) + "\n");
						return res.status(500).json({ msg: "Try again later" });
					}
					console.log('Woot! Success!');
					fs.appendFileSync('logs.txt', '/event pdf success' + JSON.stringify(result) + "\n");
					res.json(data);

					var transporter = nodemailer.createTransport({
						host: "ndec.club",
						port: 465,
						secure: true,
						tls: { rejectUnauthorized: false },
						auth: {
							user: "carnival@ndec.club",
							pass: "carnivalndecclub"
						}
					});

					var mailOptions = {
						from: "carnival@ndec.club",
						to: data.email,
						bcc: "ndec.bd@gmail.com",
						subject: "Registration for 5th NEC",
						text:
							"Hello,\n\n" +
							"Please bring the attached pdf for entry in the carnival.",
						attachments: [
							{
								filename: "5thNECadmit.pdf",
								path: pdfName,
								contentType: "application/pdf"
							}
						]
					};

					transporter.sendMail(mailOptions, function (err) {
						if (err) {
							//return cb(err, null);
							console.log(err);
							fs.appendFileSync('logs.txt', '/event email fail' + JSON.stringify(err) + "\n");
						}
						else {
							console.log("mail sent");
							fs.appendFileSync('logs.txt', '/event email success' + JSON.stringify(err) + "\n");
							fs.unlinkSync(pdfName);
							fs.unlinkSync(htmlName);
						}
					});
				});
			});
		}
		else {
			return res.status(status).json(err);
		}
	});
});

mainRouter.post("/participants", function (req, res) {
	console.log(req.body);
	//return res.json({ success: true });
	Participant.getParticipant(req.body.page, (status, err, data) => {
		if (status === 200) {
			return res.json(data);
		} else {
			return res.status(status).json(err);
		}
	});
});

mainRouter.get("/mlabtest", function (req, res) {
	mongoose.Promise = require("bluebird");
	mongoose
		.connect(
			config.dbUrl,
			{ useNewUrlParser: true }
		)
		.then(() => {
			// if all is ok we will be here
			console.log("here");
			return res.json({ ok: "Db initialized" });
		})
		.catch(err => {
			// if error we will be here
			return res.json({ ok: false, err: err });
			//process.exit(1);
		});


});


module.exports = mainRouter;
