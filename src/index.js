import './style.css';
import {TicketApp} from './js/ticketapp.js';

const ticketApp = new TicketApp('http://localhost:7070');  // URL API
ticketApp.getTickets();  // Загрузить тикеты при запуске