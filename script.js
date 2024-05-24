'use strict';
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://5ebbb8e5f2cfeb001697d05c.mockapi.io/users';
    const userTableBody = document.querySelector('#user-table tbody');
    const searchInput = document.getElementById('search');
    const sortRegistrationDateBtn = document.getElementById('sort-registration-date');
    const sortRatingBtn = document.getElementById('sort-rating');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const modal = document.getElementById('modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const paginationContainer = document.querySelector('.pagination');

    let users = [];
    let filteredUsers = [];
    let currentPage = 1;
    const usersPerPage = 5;
    let sortDirection = {
        registration_date: 'asc',
        rating: 'asc'
    };
    let userToDelete = null;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            users = data;
            filteredUsers = [...users];
            renderTable();
            renderPagination();
        });

    function renderTable() {
        userTableBody.innerHTML = '';
        const start = (currentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        const usersToDisplay = filteredUsers.slice(start, end);

        usersToDisplay.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.registration_date}</td>
                <td>${user.rating}</td>
                <td><button class="delete-btn" data-id="${user.id}"><img src="img/cancel.png" alt="Удалить"></button></td>
            `;
            userTableBody.appendChild(row);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });

        // Показывать или скрывать кнопку "Очистить фильтр" в зависимости от значения поискового ввода
        clearFiltersBtn.style.display = (searchInput.value) ? 'block' : 'none';
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(filteredUsers.length / usersPerPage);
        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.classList.toggle('active', i === currentPage);
            btn.disabled = i === currentPage;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderTable();
                renderPagination();
            });
            paginationContainer.appendChild(btn);
        }
    }

    searchInput.addEventListener('input', handleSearch);

    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        filteredUsers = users.filter(user =>
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
        currentPage = 1;
        renderTable();
        renderPagination();
    }

    sortRegistrationDateBtn.addEventListener('click', () => handleSort('registration_date'));
    sortRatingBtn.addEventListener('click', () => handleSort('rating'));

    function handleSort(field) {
        sortDirection[field] = sortDirection[field] === 'asc' ? 'desc' : 'asc';
        filteredUsers.sort((a, b) => {
            if (a[field] < b[field]) return sortDirection[field] === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return sortDirection[field] === 'asc' ? 1 : -1;
            return 0;
        });
        renderTable();
        highlightActiveSortButton(field);
        // Показывать кнопку "Очистить фильтр" после сортировки
        clearFiltersBtn.style.display = 'block';
    }

    function highlightActiveSortButton(field) {
        if (field === 'registration_date') {
            sortRegistrationDateBtn.classList.add('active');
            sortRatingBtn.classList.remove('active');
        } else {
            sortRatingBtn.classList.add('active');
            sortRegistrationDateBtn.classList.remove('active');
        }
    }

    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        filteredUsers = [...users];
        currentPage = 1;
        // Сбросить направление сортировки
        sortDirection = {
            registration_date: 'asc',
            rating: 'asc'
        };
        renderTable();
        renderPagination();
    });

    function handleDelete(event) {
        userToDelete = event.currentTarget.getAttribute('data-id');
        modal.style.display = 'flex';
    }

    confirmDeleteBtn.addEventListener('click', () => {
        filteredUsers = filteredUsers.filter(user => user.id !== userToDelete);
        users = users.filter(user => user.id !== userToDelete);
        modal.style.display = 'none';
        renderTable();
        renderPagination();
    });

    cancelDeleteBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        userToDelete = null;
    });
});
