const express = require("express");
const app = express();
const morgan = require("morgan");
require("dotenv").config();
const Person = require("./models/person");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static("build"));

// eslint-disable-next-line no-unused-vars
morgan.token("body", function (req, res) {
	return JSON.stringify(req.body);
});

app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

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
		.catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
	const body = req.body;

	if (body.name === undefined || body.number === undefined) {
		return res.status(400).json({
			error: "name or number missing",
		});
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	});

	person
		.save()
		.then((savedPerson) => {
			res.json(savedPerson.toJSON());
		})
		.catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
	const body = req.body;

	const person = {
		name: body.name,
		number: body.number,
	};
	Person.find({ name: person.name }).then((result) => {
		const uPerson = result[0];
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
		// eslint-disable-next-line no-unused-vars
		.then((result) => {
			res.status(204).end();
			console.log("Successfully deleted");
		})
		.catch((error) => {
			next(error);
		});
});

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
