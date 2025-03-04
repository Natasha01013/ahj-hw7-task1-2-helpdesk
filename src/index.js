import './style.css';
import {TicketApp} from './js/ticketapp.js';

const ticketApp = new TicketApp('http://localhost:8080');  // URL API
ticketApp.getTickets();  // Загрузить тикеты при запуске