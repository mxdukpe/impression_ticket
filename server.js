// server.js - Fichier principal du serveur Express

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tickets-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Définition du modèle de ticket
const ticketSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

// Routes API
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets', error: error.message });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du ticket', error: error.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const newTicket = new Ticket({
      eventName: req.body.eventName,
      customer: req.body.customer,
      createdAt: req.body.createdAt || new Date()
    });
    
    const savedTicket = await newTicket.save();
    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création du ticket', error: error.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        eventName: req.body.eventName,
        customer: req.body.customer
      },
      { new: true }
    );
    
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du ticket', error: error.message });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    res.json({ message: 'Ticket supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du ticket', error: error.message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});