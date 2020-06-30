const express = require("express");
const app = express();
const morgan = require("morgan");
require("dotenv").config();
const Person = require("./models/person");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static("build"));

morgan.token("body", function (req, res) {
	return JSON.stringify(req.body);
});

app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// let persons = [
// 	{
// 		name: "Arto Hellas",
// 		number: "040-123456",
// 		id: 1,
// 	},
// 	{
// 		name: "Ada Lovelace",
// 		number: "39-44-5323523",
// 		id: 2,
// 	},
// 	{
// 		name: "Dan Abramov",
// 		number: "12-43-234345",
// 		id: 3,
// 	},
// 	{
// 		name: "Mary Poppendieck",
// 		number: "39-23-6423122",
// 		id: 4,
// 	},
// ];

app.get("/", (req, res) => {
	res.send(
		"<h1>Puhelinluettelo</h1><br><a href='/api/persons'>Puhelinluetteloon</a>"
	);
});

app.get("/api/persons", (req, res) => {
	Person.find({}).then((persons) => {
		res.json(persons.map((person) => person.toJSON()));
	});
});

app.get("/info", (req, res) => {
	Person.find({}).then((persons) => {
		let entries = persons.length;
		let time = new Date();
		res.send(`<p>Phonebook has info for ${entries} people.</p>
	<p>${time}</p>`);
	});
	// let entries = persons.length;
	// let time = new Date();
	// res.send(`<p>Phonebook has info for ${entries} people.</p>
	// <p>${time}</p>`);
});

app.get("/api/persons/:id", (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			if (person) {
				res.json(person);
			} else {
				res.status(404).end();
			}
		})
		// .catch((error) => {
		// 	console.log(error);
		// 	res.status(400).send({ error: "malformatted id" });
		// });
		.catch((error) => next(error));
	// const id = Number(req.params.id);
	// const person = persons.find((p) => p.id === id);

	// if (person) {
	// 	res.json(person);
	// } else {
	// 	res.status(404).end();
	// }
});

app.post("/api/persons", (req, res, next) => {
	const body = req.body;
	//const nameList = persons.map((p) => p.name);
	//console.log(nameList);

	if (body.name === undefined || body.number === undefined) {
		return res.status(400).json({
			error: "name or number missing",
		});
	}
	// else if (nameList.includes(body.name)) {
	// 	return res.status(400).json({
	// 		error: "name must be unique",
	// 	});
	// }

	const person = new Person({
		name: body.name,
		number: body.number,
		//	id: generateId(),
	});

	person
		.save()
		.then((savedPerson) => {
			res.json(savedPerson.toJSON());
		})
		.catch((error) => next(error));
	//console.log(persons);
	// persons = persons.concat(person);
	// res.json(person);
});

app.put("/api/persons/:id", (req, res, next) => {
	const body = req.body;

	const person = {
		name: body.name,
		number: body.number,
	};
	Person.find({ name: person.name }).then((result) => {
		uPerson = result[0];
		console.log(uPerson);
		Person.findByIdAndUpdate(uPerson._id, person, { new: true })
			.then((updatedPerson) => {
				res.json(updatedPerson);
			})
			.catch((error) => next(error));
	});
});

app.delete("/api/persons/:id", (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then((result) => {
			res.status(204).end();
			console.log("Successfully deleted");
		})
		.catch((error) => {
			next(error);
		});
	// const id = Number(req.params.id);
	// persons = persons.filter((p) => p.id !== id);

	// res.status(204).end();
});

const generateId = () => {
	const id = Math.floor(Math.random() * 1000000 + 1);
	return id;
};

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	}

	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
