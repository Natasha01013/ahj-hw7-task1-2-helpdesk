export class TicketApp {
    constructor(apiUrl) {
      this.apiUrl = apiUrl;
      this.currentTicket = null;  // Для хранения тикета, который редактируется или удаляется
      // лишняя- this.closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn'); //кнопка удаления тикета
      // this.addTicketBtn = document.getElementById('addTicketBtn'); //кнопка добавления тикета справа
      // this.closeModalBtn = document.getElementById('closeModalBtn'); //кнопка закрытия модального окна
      // this.ticketForm = document.getElementById('ticketForm'); //форма тикета внутри модального окна
      // this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn'); //кнопка удалить тикет
      // this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn'); // кнопка отменить для тикета
    
      document.getElementById('addTicketBtn').addEventListener('click', () => this.openTicketModal()); 
      document.getElementById('closeModalBtn').addEventListener('click', () => this.closeTicketModal());
      document.getElementById('ticketForm').addEventListener('submit', (event) => this.handleFormSubmit(event));
      document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.deleteTicket());
      document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());
    }
  
    // Получение всех тикетов с сервера
    getTickets() {
      const loading = document.getElementById('loading'); //картинка загрузки
      loading.style.display = 'block';  // Показать иконку загрузки
  
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.apiUrl}/?method=allTickets`, true);
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const tickets = JSON.parse(xhr.response);
          this.renderTicketList(tickets);
        } else {
          console.error('Ошибка при получении тикетов');
        }
        loading.style.display = 'none';  // Скрыть иконку загрузки
      });
  
      xhr.addEventListener('error', () => {
        console.error('Ошибка сети');
        loading.style.display = 'none';  // Скрыть иконку загрузки
      });
  
      xhr.send();
    }
  
    // Рендеринг списка тикетов
    renderTicketList(tickets) {
      const ticketList = document.getElementById('ticket-list'); //список тикетов
      ticketList.innerHTML = '';  // Очистить список перед рендерингом
  
      tickets.forEach(ticket => {
        const ticketElement = document.createElement('div');
        ticketElement.classList.add('ticket');
        ticketElement.innerHTML = `
          <div>
            <h3>${ticket.name}</h3>
            <p>${ticket.status ? 'Завершено' : 'В процессе'}</p>
          </div>
          <div class="actions">
            <button onclick="ticketApp.editTicket('${ticket.id}')">✎</button>
            <button onclick="ticketApp.prepareDeleteTicket('${ticket.id}')">❌</button>
          </div>
        `;
  
        ticketElement.addEventListener('click', () => this.showTicketDetails(ticket.id));
        ticketList.appendChild(ticketElement);
      });
    }
  
    // Открытие модального окна для добавления нового тикета
    openTicketModal() {
      const ticketForm = document.getElementById('ticketForm'); //форма тикета внутри модального окна
      const ticketModal = document.getElementById('ticketModal'); //модальное окно для создания тикета
      ticketModal.style.display = 'block';
      ticketForm.reset();
      this.currentTicket = null;
    }
  
    // Закрытие модального окна
    closeTicketModal() {
      ticketModal = document.getElementById('ticketModal'); //модальное окно для создания тикета
      ticketModal.style.display = 'none';
    }
  
    // Обработчик отправки формы для добавления или редактирования тикета
    handleFormSubmit(event) {
      event.preventDefault();
  
      const name = document.getElementById('name').value; //значение названия тикета
      const description = document.getElementById('description').value; //описание тикета
  
      const xhr = new XMLHttpRequest();
      const method = this.currentTicket ? 'updateById' : 'createTicket';
      const url = this.currentTicket ? `${this.apiUrl}/?method=updateById&id=${this.currentTicket.id}` : `${this.apiUrl}/?method=createTicket`;
  
      xhr.open('POST', url, true); //true - запрос асинхронный
        xhr.setRequestHeader('Content-Type', 'application/json'); //метод для задания заголовков с именем Content-Type и значением application/json
        xhr.addEventListener('load', () => {
          console.log(xhr.response);  // Проверка ответа сервера
          if (xhr.status >= 200 && xhr.status < 300) {
            this.getTickets();  // Обновить список тикетов
            this.closeTicketModal();  // Закрыть модальное окно
          } else {
            console.error('Ошибка при сохранении тикета');
          }
      });
  
      xhr.send(JSON.stringify({ name, description })); //отправим объект в формате JSON
    }
  
    // Редактирование тикета
    editTicket(id) {
      const ticketModal = document.getElementById('ticketModal'); //модальное окно для создания тикета
      const saveTicketBtn = document.getElementById('saveTicketBtn'); //кнопка для сохранения тикета
      this.currentTicket = id;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.apiUrl}/?method=ticketById&id=${id}`, true);
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const ticket = JSON.parse(xhr.response);
          document.getElementById('name').value = ticket.name;
          document.getElementById('description').value = ticket.description;
          ticketModal.style.display = 'block';
          saveTicketBtn.textContent = 'Сохранить изменения';
        }
      });
      xhr.send();
    }
  
    // Подготовка к удалению тикета
    prepareDeleteTicket(id) {
      const deleteModal = document.getElementById('deleteModal'); //удаление модального окна
      this.currentTicket = id;
      deleteModal.style.display = 'block';
    }
  
    // Удаление тикета
    deleteTicket() {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.apiUrl}/?method=deleteById&id=${this.currentTicket}`, true);
      xhr.addEventListener('load', () => {
        if (xhr.status === 204) {
          this.getTickets();  // Обновить список тикетов
          this.closeDeleteModal();  // Закрыть модальное окно
        } else {
          console.error('Ошибка при удалении тикета');
        }
      });
      xhr.send();
    }
  
    // Закрытие модального окна для удаления
    closeDeleteModal() {
      const deleteModal = document.getElementById('deleteModal'); //удаление модального окна
      deleteModal.style.display = 'none';
    }
  
    // Показать подробности тикета
    showTicketDetails(id) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.apiUrl}/?method=ticketById&id=${id}`, true);
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const ticket = JSON.parse(xhr.response);
          alert(`Тикет: ${ticket.name}\nОписание: ${ticket.description}`);
        }
      });
      xhr.send();
    }
  }