const mongoose = require("mongoose");

if (process.argv.length < 3) {
	console.log("give password as argument");
	process.exit(1);
}
if (process.argv.length > 5) {
	console.log(
		"give password, then provide name (within quotes if more than one word) and number"
	);
	process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://phonebook:${password}@cluster0-afdrg.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
});

const Person = mongoose.model("Person", personSchema);

// const person = new Person({
// 	name: "Arto Hellas",
// 	number: "040-123456",
// });

// person.save().then((response) => {
// 	console.log("person saved!", person);
// 	mongoose.connection.close();
// });

if (process.argv.length === 5) {
	const person = new Person({
		name: process.argv[3],
		number: process.argv[4],
	});

	person.save().then((response) => {
		console.log(
			`successfully added ${person.name} number ${person.number} to phonebook`
		);
		mongoose.connection.close();
	});
}
if (process.argv.length === 3) {
	Person.find({}).then((result) => {
		console.log("phonebook:");
		result.forEach((person) => {
			console.log(person.name, person.number);
		});
		mongoose.connection.close();
	});
}
