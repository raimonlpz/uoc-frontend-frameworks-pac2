/**
 * @class Service
 *
 * Manages the data of the application.
 */
class UserService {
    constructor() {
      this.users = (JSON.parse(localStorage.getItem("users")) || []).map(
        user => new User(user)
      );
      this.currentPage = parseInt(localStorage.getItem("currentPage")) || 0;
      this.initialState = true;
    }
  
    bindUserListChanged(callback) {
      this.onUserListChanged = callback;
    }
  
    _commit(users) {
      let paginatedUsers;
      paginatedUsers = [...users].slice(this.currentPage * 5, this.currentPage * 5 + 5);
      if(paginatedUsers.length === 0) {
        // this means that user deleted all registries from last page. we redirect to first page 
        paginatedUsers = [...users].slice(0, 5);
      }
      localStorage.setItem("users", JSON.stringify(users));
      this.onUserListChanged(paginatedUsers);
    }
  
    addUser(user) {
      this.users.push(new User(user));
      this._commit(this.users);
    }
  
    editUser(user) {
      this.users = this.users.map(u => 
        u.id === user.id 
          ? { ...user } 
          : u
      );
      this._commit(this.users);
    }
  
    deleteUser(_id) {
      if(Array.isArray(_id)) {
        _id.map(i => {
          this.users = this.users.filter(({ id }) => id !== i);
        });
      
        this._commit(this.users);
        return;
      }

      this.users = this.users.filter(({ id }) => id !== _id);
      this._commit(this.users);
    }

    toggleUser(_id, isChecked) {
      this.users = this.users.map(user => 
        user.id === _id 
          ? { ...user, 'shouldBeDeleted': isChecked } 
          : user
      );
      this._commit(this.users);
    }

    setCurrentPage(page) {
      this.currentPage = page;
      localStorage.setItem("currentPage", page);
      this._commit(this.users);
    }
}