export class TicketApp {
    constructor(apiUrl) {
      this.apiUrl = apiUrl;
      this.currentTicket = null;  // Для хранения тикета, который редактируется или удаляется
    
      document.getElementById('addTicketBtn').addEventListener('click', () => this.openTicketModal()); //кнопка "добавить тикет"
      document.getElementById('closeModalBtn').addEventListener('click', () => this.closeTicketModal());//кнопка закрытия модального окна
      document.getElementById('ticketForm').addEventListener('submit', (event) => this.handleFormSubmit(event));//форма тикета внутри модального окна
      document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.deleteTicket()); //кнопка удалить тикет
      document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal()); // кнопка отменить при удалении тикета
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
            <button data-id="${ticket.id}" class="edit-btn">✎</button>
            <button data-id="${ticket.id}" class="delete-btn">❌</button>
          </div>
        `;
  
        ticketElement.addEventListener('click', () => this.showTicketDetails(ticket.id));
        ticketList.appendChild(ticketElement);

        // Добавляем обработчики событий для кнопок редактирования и удаления
        document.querySelectorAll('.edit-btn').forEach(button => {
          button.addEventListener('click', () => this.editTicket(button.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', () => this.prepareDeleteTicket(button.dataset.id));
        });
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
      const ticketModal = document.getElementById('ticketModal'); //модальное окно для создания тикета
      ticketModal.style.display = 'none';
    }
  
    // Обработчик отправки формы для добавления или редактирования тикета
    handleFormSubmit(event) {
      event.preventDefault();

      const name = document.getElementById('name').value; //Название тикета
      const description = document.getElementById('description').value; //Описание тикета
  
      if (this.currentTicket) {
          // Редактирование существующего тикета
          console.log('ID тикета для обновления:', this.currentTicket); 
          const url = `${this.apiUrl}/?method=updateById&id=${this.currentTicket}`;
          console.log('URL для обновления:', url);
  
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url, true); //true - запрос асинхронный
          xhr.setRequestHeader('Content-Type', 'application/json');//метод для задания заголовков с именем Content-Type и значением application/json
  
          xhr.addEventListener('load', () => {
              console.log(xhr.response);// Проверка ответа сервера
              if (xhr.status >= 200 && xhr.status < 300) {
                  this.getTickets();// Обновить список тикетов
                  this.closeTicketModal();// Закрыть модальное окно
              } else {
                  console.error('Ошибка при сохранении тикета');
              }
          });
  
          xhr.send(JSON.stringify({ name, description }));
      } else {
          // Создание нового тикета
          console.log("создание нового тикета");
          const url = `${this.apiUrl}/?method=createTicket`;
  
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
  
          xhr.addEventListener('load', () => {
              console.log(xhr.response);
              if (xhr.status >= 200 && xhr.status < 300) {
                  this.getTickets();
                  this.closeTicketModal();
              } else {
                  console.error('Ошибка при сохранении тикета');
              }
          });
  
          xhr.send(JSON.stringify({ name, description }));
      }
  }

    // Редактирование тикета
    editTicket(id) {
      console.log('ID тикета для редактирования:', id); 
      const ticketModal = document.getElementById('ticketModal'); //модальное окно для создания тикета
      const saveTicketBtn = document.getElementById('saveTicketBtn'); //кнопка для сохранения тикета
      this.currentTicket = id;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.apiUrl}/?method=ticketById&id=${id}`, true);
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const ticket = JSON.parse(xhr.response);
          console.log('Тикет, полученный с сервера:', ticket); //Проверим ID тикета, полученного из ответа сервера
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