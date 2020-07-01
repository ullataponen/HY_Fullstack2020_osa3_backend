const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useCreateIndex", true);

const url = process.env.MONGODB_URI;

console.log("connecting to", url);
mongoose
	.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
	// eslint-disable-next-line no-unused-vars
	.then((result) => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB:", error.message);
	});

const personSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true, minlength: 3 },
	number: { type: String, required: true, minlength: 8 },
});

personSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

personSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Person", personSchema);
