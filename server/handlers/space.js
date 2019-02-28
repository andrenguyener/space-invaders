// @ts-check
"use strict";

const express = require("express");

// const Address = require("./../models/address/address-class");
// const sendToMQ = require("./message-queue");

const SpaceHandler = spaceStore => {
	if (!spaceStore) {
		throw new Error("no space table found");
	}

	// A signal indicating that the promise should break here.
	class BreakSignal {}
	const breakSignal = new BreakSignal();

	const router = express.Router();

    // get top 10 highscores
	router.get("/v1/highscore", (req, res) => {
	});

	// insert highscore if top 10
	router.post("/v1/highscore", (req, res) => {
	});

	router.patch("/v1/address", (req, res) => {
		// let userJSON = JSON.parse(req.get("X-User"));
		// let userId = userJSON.userId;
		// let addressId = req.body.addressId;
		// let streetAddress1 = req.body.streetAddress1;
		// let streetAddress2 = req.body.streetAddress2;
		// let cityName = req.body.cityName;
		// let zipCode = req.body.zipCode;
		// let stateName = req.body.stateName;
		// let aliasName = req.body.aliasName;
		// let address = new Address(
		// 	userId,
		// 	streetAddress1,
		// 	streetAddress2,
		// 	cityName,
		// 	zipCode,
		// 	stateName,
		// 	aliasName
		// );
		// addressStore
		// 	.update(addressId, address)
		// 	.then(address => {
		// 		res.json(address);
		// 	})
		// 	.catch(err => {
		// 		if (err !== breakSignal) {
		// 			console.log(err);
		// 		}
		// 	});
	});

	router.delete("", (req, res) => {});

	return router;
};

module.exports = SpaceHandler;
